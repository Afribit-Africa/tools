/**
 * Flashlight Service - Lightning Address Verification
 *
 * Verifies Lightning addresses by checking:
 * 1. Format validation (email-like format)
 * 2. Domain HTTPS endpoint (.well-known/lnurlp/)
 * 3. LNURL response validity
 *
 * Prevents invalid addresses from being used in batch payments.
 */

export interface FlashlightVerificationResult {
  valid: boolean;
  address: string;
  error?: string;
  metadata?: {
    minSendable?: number;
    maxSendable?: number;
    commentAllowed?: number;
    tag?: string;
  };
}

/**
 * Verify a Lightning address is valid and reachable
 */
export async function verifyLightningAddress(
  address: string
): Promise<FlashlightVerificationResult> {
  try {
    // Basic format validation
    if (!address || !address.includes('@')) {
      return {
        valid: false,
        address,
        error: 'Invalid format: Lightning address must be in format user@domain.com'
      };
    }

    const [username, domain] = address.split('@');

    if (!username || !domain) {
      return {
        valid: false,
        address,
        error: 'Invalid format: Missing username or domain'
      };
    }

    // Check LNURL endpoint
    const lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`;

    const response = await fetch(lnurlEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      return {
        valid: false,
        address,
        error: `LNURL endpoint returned ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    // Validate LNURL response
    if (data.status === 'ERROR') {
      return {
        valid: false,
        address,
        error: data.reason || 'LNURL endpoint returned error'
      };
    }

    if (!data.callback || !data.minSendable || !data.maxSendable) {
      return {
        valid: false,
        address,
        error: 'LNURL response missing required fields'
      };
    }

    if (data.tag !== 'payRequest') {
      return {
        valid: false,
        address,
        error: `Invalid LNURL tag: expected 'payRequest', got '${data.tag}'`
      };
    }

    return {
      valid: true,
      address,
      metadata: {
        minSendable: data.minSendable,
        maxSendable: data.maxSendable,
        commentAllowed: data.commentAllowed,
        tag: data.tag
      }
    };

  } catch (error: any) {
    return {
      valid: false,
      address,
      error: error.message || 'Failed to verify Lightning address'
    };
  }
}

/**
 * Verify multiple Lightning addresses in parallel
 */
export async function verifyBatchLightningAddresses(
  addresses: string[]
): Promise<Map<string, FlashlightVerificationResult>> {
  const results = new Map<string, FlashlightVerificationResult>();

  // Verify in parallel with controlled concurrency
  const batchSize = 10;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(addr => verifyLightningAddress(addr))
    );

    batchResults.forEach(result => {
      results.set(result.address, result);
    });
  }

  return results;
}

/**
 * Clean and normalize Lightning address
 */
export function cleanLightningAddress(address: string): string {
  return address.trim().toLowerCase();
}
