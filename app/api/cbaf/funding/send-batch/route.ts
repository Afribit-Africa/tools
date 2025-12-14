import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { fundingDisbursements, superAdminSettings, economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { extractUsername } from '@/lib/blink';
import { decrypt } from '@/lib/crypto/encryption';

interface PaymentItem {
  id: string;
  economyId: string;
  economyName: string;
  address: string;
  amount: number;
}

interface SendBatchRequest {
  payments: PaymentItem[];
  fundingMonth: string;
  fundingYear: number;
  memo?: string;
}

interface PaymentResult {
  economyId: string;
  economyName: string;
  address: string;
  amount: number;
  success: boolean;
  error?: string;
  paymentHash?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendBatchRequest = await request.json();
    const { payments, fundingMonth, fundingYear, memo } = body;

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json({ error: 'No payments provided' }, { status: 400 });
    }

    // Get Blink API key from settings
    const apiKeySetting = await db
      .select()
      .from(superAdminSettings)
      .where(eq(superAdminSettings.key, 'blink_api_key'))
      .limit(1);

    if (!apiKeySetting[0]?.encryptedValue) {
      return NextResponse.json(
        { error: 'Blink API key not configured. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const apiKey = decrypt(apiKeySetting[0].encryptedValue);

    // Get wallet ID from settings metadata
    let walletId: string | undefined;
    if (apiKeySetting[0].metadata) {
      try {
        const metadata = JSON.parse(apiKeySetting[0].metadata);
        walletId = metadata.defaultWalletId;
      } catch {
        // Ignore parse errors
      }
    }

    if (!walletId) {
      return NextResponse.json(
        { error: 'No wallet configured. Please connect your Blink wallet in Settings.' },
        { status: 400 }
      );
    }

    const results: PaymentResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let totalSent = 0;

    // Process each payment
    for (const payment of payments) {
      const { economyId, economyName, address, amount } = payment;
      const username = extractUsername(address);

      if (!username) {
        results.push({
          economyId,
          economyName,
          address,
          amount,
          success: false,
          error: 'Invalid address format',
        });
        failedCount++;
        continue;
      }

      try {
        // Send payment via Blink API
        const paymentMemo = memo || `CBAF Funding - ${fundingMonth}`;

        const response = await fetch('https://api.blink.sv/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
          body: JSON.stringify({
            query: `
              mutation IntraLedgerPaymentSend($input: IntraLedgerPaymentSendInput!) {
                intraLedgerPaymentSend(input: $input) {
                  status
                  errors {
                    message
                  }
                }
              }
            `,
            variables: {
              input: {
                walletId,
                recipientWalletId: username, // Will be resolved by Blink
                amount,
                memo: paymentMemo,
              },
            },
          }),
        });

        const data = await response.json();

        if (data.errors || data.data?.intraLedgerPaymentSend?.errors?.length > 0) {
          const errorMsg = data.errors?.[0]?.message ||
                          data.data?.intraLedgerPaymentSend?.errors?.[0]?.message ||
                          'Payment failed';

          results.push({
            economyId,
            economyName,
            address,
            amount,
            success: false,
            error: errorMsg,
          });
          failedCount++;

          // Record failed disbursement
          await db.insert(fundingDisbursements).values({
            economyId,
            amountSats: amount,
            fundingMonth,
            fundingYear,
            paymentMethod: 'lightning',
            status: 'failed',
            errorMessage: errorMsg,
            initiatedBy: session.user.email || 'super_admin',
          });
        } else {
          const status = data.data?.intraLedgerPaymentSend?.status;

          results.push({
            economyId,
            economyName,
            address,
            amount,
            success: true,
            paymentHash: status,
          });
          successCount++;
          totalSent += amount;

          // Record successful disbursement
          await db.insert(fundingDisbursements).values({
            economyId,
            amountSats: amount,
            fundingMonth,
            fundingYear,
            paymentMethod: 'lightning',
            status: 'completed',
            initiatedBy: session.user.email || 'super_admin',
            processedAt: new Date(),
            completedAt: new Date(),
          });

          // Update economy's total funding received
          const [economy] = await db
            .select({ totalFundingReceived: economies.totalFundingReceived })
            .from(economies)
            .where(eq(economies.id, economyId));

          if (economy) {
            await db
              .update(economies)
              .set({
                totalFundingReceived: (economy.totalFundingReceived || 0) + amount,
                updatedAt: new Date(),
              })
              .where(eq(economies.id, economyId));
          }
        }
      } catch (error) {
        console.error(`Payment error for ${economyName}:`, error);
        results.push({
          economyId,
          economyName,
          address,
          amount,
          success: false,
          error: 'Network error during payment',
        });
        failedCount++;

        // Record failed disbursement
        await db.insert(fundingDisbursements).values({
          economyId,
          amountSats: amount,
          fundingMonth,
          fundingYear,
          paymentMethod: 'lightning',
          status: 'failed',
          errorMessage: 'Network error during payment',
          initiatedBy: session.user.email || 'super_admin',
        });
      }

      // Small delay between payments to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: payments.length,
        successful: successCount,
        failed: failedCount,
        totalSent,
        fundingMonth,
        fundingYear,
      },
    });
  } catch (error) {
    console.error('Error sending batch payments:', error);
    return NextResponse.json(
      { error: 'Failed to process batch payments' },
      { status: 500 }
    );
  }
}
