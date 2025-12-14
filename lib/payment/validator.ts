/**
 * Unified Payment Address Validator
 * Handles validation for multiple payment providers (Blink, Fedi, Machankura, Other)
 */

import { verifyBlinkAddress, type BlinkVerificationResult } from '@/lib/blink/client';
import { verifyFediAddress, type FediValidationResult } from '@/lib/fedi/client';
import { verifyMachankuraAddress, type MachankuraValidationResult } from '@/lib/machankura/client';

export type PaymentProvider = 'blink' | 'fedi' | 'machankura' | 'other';

export interface PaymentValidationResult {
  valid: boolean;
  provider: PaymentProvider;
  address: string;
  error?: string;
  metadata?: {
    walletId?: string;
    walletCurrency?: string;
    country?: string;
  };
}

/**
 * Validates a payment address based on the specified provider
 *
 * @param address - The payment address to validate
 * @param provider - The payment provider (blink, fedi, machankura, other)
 * @returns Validation result with metadata
 */
export async function validatePaymentAddress(
  address: string,
  provider: PaymentProvider
): Promise<PaymentValidationResult> {

  // Sanitize input
  const cleaned = address.trim().toLowerCase();

  if (!cleaned) {
    return {
      valid: false,
      provider,
      address: cleaned,
      error: 'Address cannot be empty',
    };
  }

  switch (provider) {
    case 'blink': {
      // Extract username from lightning address (remove @blink.sv if present)
      let username = cleaned;
      if (username.includes('@')) {
        username = username.split('@')[0];
      }

      const blinkResult = await verifyBlinkAddress(username);
      return {
        valid: blinkResult.valid,
        provider: 'blink',
        address: `${username}@blink.sv`, // Return standardized format
        error: blinkResult.error,
        metadata: blinkResult.valid ? {
          walletId: blinkResult.walletId,
          walletCurrency: blinkResult.walletCurrency,
        } : undefined,
      };
    }

    case 'fedi': {
      const fediResult = await verifyFediAddress(cleaned);
      return {
        valid: fediResult.valid,
        provider: 'fedi',
        address: cleaned,
        error: fediResult.error,
      };
    }

    case 'machankura': {
      const machankuraResult = await verifyMachankuraAddress(address); // Don't lowercase for phone numbers
      return {
        valid: machankuraResult.valid,
        provider: 'machankura',
        address: address.trim(),
        error: machankuraResult.error,
        metadata: machankuraResult.valid ? {
          country: machankuraResult.country,
        } : undefined,
      };
    }

    case 'other': {
      // For "other" providers, just check it's not empty
      // Could add basic lightning address format validation here
      const isValid = cleaned.length > 0;
      return {
        valid: isValid,
        provider: 'other',
        address: cleaned,
        error: isValid ? undefined : 'Address cannot be empty',
      };
    }

    default: {
      return {
        valid: false,
        provider,
        address: cleaned,
        error: 'Unsupported payment provider',
      };
    }
  }
}

/**
 * Validates multiple payment addresses in batch
 * Processes in batches to avoid overwhelming APIs
 *
 * @param addresses - Array of addresses with their providers
 * @param onProgress - Optional callback for progress updates
 * @returns Array of validation results
 */
export async function batchValidateAddresses(
  addresses: Array<{ address: string; provider: PaymentProvider }>,
  onProgress?: (completed: number, total: number) => void
): Promise<PaymentValidationResult[]> {
  const results: PaymentValidationResult[] = [];
  const batchSize = 10; // Process 10 at a time to avoid rate limiting

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(item => validatePaymentAddress(item.address, item.provider))
    );

    // Map results
    results.push(
      ...batchResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // If promise rejected, return error result
          return {
            valid: false,
            provider: batch[index].provider,
            address: batch[index].address,
            error: 'Validation failed: ' + result.reason,
          };
        }
      })
    );

    // Call progress callback
    if (onProgress) {
      const completed = Math.min(i + batchSize, addresses.length);
      onProgress(completed, addresses.length);
    }

    // Add small delay between batches to be respectful to APIs
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Sanitizes a payment address by trimming whitespace
 * Use before storing in database
 */
export function sanitizeAddress(address: string, provider: PaymentProvider): string {
  const trimmed = address.trim();

  // For Blink and Fedi, lowercase
  if (provider === 'blink' || provider === 'fedi') {
    return trimmed.toLowerCase();
  }

  // For Machankura (phone numbers), keep original case but trim
  return trimmed;
}

/**
 * Gets a human-readable provider name
 */
export function getProviderDisplayName(provider: PaymentProvider): string {
  const names: Record<PaymentProvider, string> = {
    blink: 'Blink',
    fedi: 'Fedi',
    machankura: 'Machankura',
    other: 'Other',
  };
  return names[provider];
}
