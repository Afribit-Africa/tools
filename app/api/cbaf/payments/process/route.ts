import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { fundingDisbursements, economies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendBatchPayments } from '@/lib/blink/payment-service';

/**
 * POST - Process payments for a specific period
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { period, economyIds } = body;

    if (!period || typeof period !== 'string') {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    // Fetch pending disbursements for the period with economy data
    // Period is in format "YYYY-MM"
    const [year, month] = period.split('-').map(Number);

    const disbursementsData = await db
      .select({
        id: fundingDisbursements.id,
        economyId: fundingDisbursements.economyId,
        amountSats: fundingDisbursements.amountSats,
        status: fundingDisbursements.status,
        economyName: economies.economyName,
        lightningAddress: economies.lightningAddress,
      })
      .from(fundingDisbursements)
      .leftJoin(economies, eq(fundingDisbursements.economyId, economies.id))
      .where(
        and(
          eq(fundingDisbursements.fundingMonth, period),
          eq(fundingDisbursements.status, 'pending')
        )
      );

    if (disbursementsData.length === 0) {
      return NextResponse.json(
        { error: 'No pending disbursements found for this period' },
        { status: 404 }
      );
    }

    // Filter by economy IDs if provided
    const targetDisbursements = economyIds
      ? disbursementsData.filter((d) => economyIds.includes(d.economyId))
      : disbursementsData;

    if (targetDisbursements.length === 0) {
      return NextResponse.json(
        { error: 'No matching disbursements found' },
        { status: 404 }
      );
    }

    // Validate all have lightning addresses
    const invalidDisbursements = targetDisbursements.filter(
      (d) => !d.lightningAddress
    );

    if (invalidDisbursements.length > 0) {
      return NextResponse.json(
        {
          error: `${invalidDisbursements.length} disbursements missing lightning addresses`,
          invalidEconomies: invalidDisbursements.map((d) => ({
            economyId: d.economyId,
            economyName: d.economyName,
          })),
        },
        { status: 400 }
      );
    }

    // Prepare payments
    const payments = targetDisbursements.map((d) => ({
      lightningAddress: d.lightningAddress!,
      amountSats: d.amountSats || 0,
      memo: `CBAF ${period} - ${d.economyName}`,
      economyId: d.economyId,
    }));

    // Process payments
    const results = await sendBatchPayments(payments);

    // Update disbursement statuses
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    for (const result of results) {
      const disbursement = targetDisbursements.find(
        (d) => d.economyId === result.economyId
      );

      if (!disbursement) continue;

      await db
        .update(fundingDisbursements)
        .set({
          status: result.success ? 'completed' : 'failed',
          completedAt: result.success ? new Date() : null,
          paymentHash: result.paymentHash || null,
          errorMessage: result.error || null,
          processedAt: new Date(),
        })
        .where(eq(fundingDisbursements.id, disbursement.id));
    }

    return NextResponse.json({
      success: true,
      totalProcessed: results.length,
      successCount,
      failureCount,
      results: results.map((r) => ({
        economyId: r.economyId,
        lightningAddress: r.lightningAddress,
        success: r.success,
        error: r.error,
      })),
    });
  } catch (error) {
    console.error('Error processing payments:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process payments',
      },
      { status: 500 }
    );
  }
}
