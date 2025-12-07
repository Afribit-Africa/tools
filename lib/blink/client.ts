import { GraphQLClient } from 'graphql-request';

const BLINK_API_URL = process.env.BLINK_API_URL || 'https://api.blink.sv/graphql';

export const blinkClient = new GraphQLClient(BLINK_API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCOUNT_DEFAULT_WALLET_QUERY = `
  query VerifyBlinkAddress($username: Username!) {
    accountDefaultWallet(username: $username) {
      id
      walletCurrency
    }
  }
`;

export interface BlinkVerificationResult {
  valid: boolean;
  walletId?: string;
  walletCurrency?: string;
  error?: string;
}

export async function verifyBlinkAddress(username: string): Promise<BlinkVerificationResult> {
  try {
    const data = await blinkClient.request<{
      accountDefaultWallet: {
        id: string;
        walletCurrency: string;
      };
    }>(ACCOUNT_DEFAULT_WALLET_QUERY, { username });

    return {
      valid: true,
      walletId: data.accountDefaultWallet.id,
      walletCurrency: data.accountDefaultWallet.walletCurrency,
    };
  } catch (error: any) {
    // Address doesn't exist or other error
    return {
      valid: false,
      error: error.response?.errors?.[0]?.message || 'Address not found',
    };
  }
}

export async function batchVerifyAddresses(
  usernames: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<BlinkVerificationResult[]> {
  const results: BlinkVerificationResult[] = [];
  const batchSize = 10; // Verify 10 at a time to avoid rate limiting

  for (let i = 0; i < usernames.length; i += batchSize) {
    const batch = usernames.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(username => verifyBlinkAddress(username))
    );

    results.push(
      ...batchResults.map(result =>
        result.status === 'fulfilled'
          ? result.value
          : { valid: false, error: 'Verification failed' }
      )
    );

    if (onProgress) {
      onProgress(Math.min(i + batchSize, usernames.length), usernames.length);
    }

    // Add small delay between batches to be respectful to the API
    if (i + batchSize < usernames.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
