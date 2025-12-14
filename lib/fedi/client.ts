/**
 * Fedi Lightning Address Client
 * Handles validation and format checking for Fedi lightning addresses
 */

export interface FediValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates Fedi lightning address format
 * Fedi addresses typically follow the pattern: user@federation.fedi.xyz
 *
 * @param address - The Fedi lightning address to validate
 * @returns Validation result with error message if invalid
 */
export function validateFediFormat(address: string): FediValidationResult {
  // Fedi address pattern: user@federation.fedi.xyz or similar
  const fediPattern = /^[a-z0-9_-]+@[a-z0-9.-]+\.fedi(\.xyz)?$/i;

  if (!address || address.trim().length === 0) {
    return {
      valid: false,
      error: 'Address cannot be empty',
    };
  }

  const cleaned = address.trim().toLowerCase();

  if (!fediPattern.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid Fedi address format. Expected: user@federation.fedi.xyz',
    };
  }

  // Check for common mistakes
  if (!cleaned.includes('@')) {
    return {
      valid: false,
      error: 'Fedi address must include @ symbol',
    };
  }

  if (!cleaned.includes('.fedi')) {
    return {
      valid: false,
      error: 'Fedi address must include .fedi domain',
    };
  }

  return { valid: true };
}

/**
 * Future: Add API validation when Fedi provides public validation endpoint
 * For now, we only validate format
 */
export async function verifyFediAddress(address: string): Promise<FediValidationResult> {
  // Currently only format validation
  // TODO: Add API call when Fedi provides validation endpoint
  return validateFediFormat(address);
}
