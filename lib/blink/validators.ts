export interface SanitizeResult {
  cleaned: string;
  wasModified: boolean;
  issues: string[];
}

export interface ValidationResult extends SanitizeResult {
  original: string;
  valid: boolean;
  error?: string;
  status: 'valid' | 'invalid' | 'fixed';
}

const VALID_BLINK_DOMAINS = ['blink.sv', 'pay.blink.sv'];

export function sanitizeAddress(address: string): SanitizeResult {
  const original = address;
  const issues: string[] = [];

  // Trim whitespace
  let cleaned = address.trim();

  if (original !== cleaned) {
    issues.push('Trimmed whitespace');
  }

  // Convert to lowercase for consistency
  cleaned = cleaned.toLowerCase();
  if (original.toLowerCase() !== original) {
    issues.push('Converted to lowercase');
  }

  return {
    cleaned,
    wasModified: original !== cleaned,
    issues,
  };
}

export function parseBlinkAddress(address: string): {
  username: string | null;
  domain: string | null;
  isValid: boolean;
  error?: string;
} {
  const parts = address.split('@');

  if (parts.length !== 2) {
    return {
      username: null,
      domain: null,
      isValid: false,
      error: 'Invalid lightning address format (expected: username@domain)',
    };
  }

  const [username, domain] = parts;

  if (!username || username.length === 0) {
    return {
      username: null,
      domain,
      isValid: false,
      error: 'Username cannot be empty',
    };
  }

  if (!VALID_BLINK_DOMAINS.includes(domain)) {
    return {
      username,
      domain,
      isValid: false,
      error: `Not a Blink address (expected domain: ${VALID_BLINK_DOMAINS.join(' or ')})`,
    };
  }

  return {
    username,
    domain,
    isValid: true,
  };
}

export function extractUsername(address: string): string | null {
  const parsed = parseBlinkAddress(address);
  return parsed.username;
}

export function isBlinkAddress(address: string): boolean {
  const parsed = parseBlinkAddress(address);
  return parsed.isValid;
}
