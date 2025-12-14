/**
 * Machankura Lightning Address Client
 * Handles validation for Machankura phone-based lightning addresses
 * Machankura uses phone numbers as lightning addresses in African countries
 */

export interface MachankuraValidationResult {
  valid: boolean;
  error?: string;
  country?: string;
}

// Supported countries with their phone prefixes
const SUPPORTED_COUNTRIES = {
  '+27': 'South Africa',
  '+254': 'Kenya',
  '+256': 'Uganda',
  '+233': 'Ghana',
  '+234': 'Nigeria',
} as const;

/**
 * Validates Machankura phone number format
 * Machankura addresses are phone numbers: +27XXXXXXXXX, +254XXXXXXXXX, etc.
 *
 * @param phone - The phone number to validate
 * @returns Validation result with error message if invalid
 */
export function validateMachankuraFormat(phone: string): MachankuraValidationResult {
  if (!phone || phone.trim().length === 0) {
    return {
      valid: false,
      error: 'Phone number cannot be empty',
    };
  }

  const cleaned = phone.trim();

  // Check if starts with +
  if (!cleaned.startsWith('+')) {
    return {
      valid: false,
      error: 'Phone number must start with + (e.g., +27XXXXXXXXX)',
    };
  }

  // Find matching country prefix
  const countryPrefix = Object.keys(SUPPORTED_COUNTRIES).find(prefix =>
    cleaned.startsWith(prefix)
  );

  if (!countryPrefix) {
    return {
      valid: false,
      error: `Unsupported country. Supported: ${Object.keys(SUPPORTED_COUNTRIES).join(', ')}`,
    };
  }

  // Validate format based on country
  const phonePattern = /^\+(?:27|254|256|233|234)\d{9,10}$/;

  if (!phonePattern.test(cleaned)) {
    return {
      valid: false,
      error: `Invalid phone number format for ${SUPPORTED_COUNTRIES[countryPrefix as keyof typeof SUPPORTED_COUNTRIES]}`,
    };
  }

  return {
    valid: true,
    country: SUPPORTED_COUNTRIES[countryPrefix as keyof typeof SUPPORTED_COUNTRIES],
  };
}

/**
 * Verify Machankura address
 * Currently only format validation
 * Future: Add API validation when Machankura provides endpoint
 */
export async function verifyMachankuraAddress(phone: string): Promise<MachankuraValidationResult> {
  // Currently only format validation
  // TODO: Add API call when Machankura provides validation endpoint
  return validateMachankuraFormat(phone);
}

/**
 * Get list of supported countries
 */
export function getSupportedCountries(): Record<string, string> {
  return { ...SUPPORTED_COUNTRIES };
}
