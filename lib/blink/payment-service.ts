import { db } from '@/lib/db';
import { superAdminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto/encryption';

const BLINK_API_URL = 'https://api.blink.sv/graphql';
const BLINK_API_KEY_SETTING = 'blink_api_key';

/**
 * Get decrypted Blink API key
 */
async function getBlinkApiKey(): Promise<string> {
  const setting = await db.query.superAdminSettings.findFirst({
    where: eq(superAdminSettings.key, BLINK_API_KEY_SETTING),
  });

  if (!setting) {
    throw new Error('Blink API key not configured. Please add it in Settings.');
  }

  if (!setting.isConnected) {
    throw new Error('Blink wallet not connected. Please test the connection in Settings.');
  }

  return decrypt(setting.encryptedValue);
}

/**
 * Execute GraphQL query against Blink API
 */
async function executeBlink<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const apiKey = await getBlinkApiKey();

  const response = await fetch(BLINK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Blink API request failed: ${errorText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
  }

  return data.data as T;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<number> {
  const query = `
    query Me {
      me {
        defaultAccount {
          wallets {
            walletCurrency
            balance
          }
        }
      }
    }
  `;

  const data = await executeBlink<{
    me: {
      defaultAccount: {
        wallets: Array<{ walletCurrency: string; balance: number }>;
      };
    };
  }>(query);

  const btcWallet = data.me.defaultAccount.wallets.find(
    (w) => w.walletCurrency === 'BTC'
  );

  return btcWallet?.balance || 0;
}

/**
 * Send Lightning payment via Blink
 */
export async function sendLightningPayment(
  lightningAddress: string,
  amountSats: number,
  memo?: string
): Promise<{ success: boolean; paymentHash?: string; error?: string }> {
  try {
    const mutation = `
      mutation LnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
        lnInvoicePaymentSend(input: $input) {
          status
          errors {
            message
          }
        }
      }
    `;

    // First, decode the lightning address to get an invoice
    const invoiceQuery = `
      query LnInvoiceCreateOnBehalfOfRecipient($input: LnInvoiceCreateOnBehalfOfRecipientInput!) {
        lnInvoiceCreateOnBehalfOfRecipient(input: $input) {
          invoice {
            paymentRequest
            paymentHash
          }
          errors {
            message
          }
        }
      }
    `;

    // Create invoice for the recipient
    const invoiceData = await executeBlink<{
      lnInvoiceCreateOnBehalfOfRecipient: {
        invoice?: {
          paymentRequest: string;
          paymentHash: string;
        };
        errors?: Array<{ message: string }>;
      };
    }>(invoiceQuery, {
      input: {
        recipientWalletId: lightningAddress,
        amount: amountSats,
        memo: memo || 'CBAF Merchant Payment',
      },
    });

    if (invoiceData.lnInvoiceCreateOnBehalfOfRecipient.errors?.length) {
      throw new Error(
        invoiceData.lnInvoiceCreateOnBehalfOfRecipient.errors[0].message
      );
    }

    const invoice = invoiceData.lnInvoiceCreateOnBehalfOfRecipient.invoice;
    if (!invoice) {
      throw new Error('Failed to create invoice');
    }

    // Send payment
    const paymentData = await executeBlink<{
      lnInvoicePaymentSend: {
        status: string;
        errors?: Array<{ message: string }>;
      };
    }>(mutation, {
      input: {
        paymentRequest: invoice.paymentRequest,
        memo,
      },
    });

    if (paymentData.lnInvoicePaymentSend.errors?.length) {
      throw new Error(paymentData.lnInvoicePaymentSend.errors[0].message);
    }

    return {
      success: paymentData.lnInvoicePaymentSend.status === 'SUCCESS',
      paymentHash: invoice.paymentHash,
    };
  } catch (error) {
    console.error('Lightning payment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Send batch Lightning payments
 */
export async function sendBatchPayments(
  payments: Array<{
    lightningAddress: string;
    amountSats: number;
    memo?: string;
    economyId?: string;
  }>
): Promise<
  Array<{
    lightningAddress: string;
    success: boolean;
    paymentHash?: string;
    error?: string;
    economyId?: string;
  }>
> {
  const results = [];

  for (const payment of payments) {
    const result = await sendLightningPayment(
      payment.lightningAddress,
      payment.amountSats,
      payment.memo
    );

    results.push({
      lightningAddress: payment.lightningAddress,
      economyId: payment.economyId,
      ...result,
    });

    // Add small delay between payments to avoid rate limiting
    if (payments.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Verify Lightning address is valid
 */
export async function verifyLightningAddress(
  lightningAddress: string
): Promise<boolean> {
  try {
    // Simple validation - check if it's a valid email-like format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(lightningAddress);
  } catch (error) {
    return false;
  }
}
