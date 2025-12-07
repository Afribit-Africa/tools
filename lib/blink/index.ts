export { blinkClient, verifyBlinkAddress, batchVerifyAddresses } from './client';
export type { BlinkVerificationResult } from './client';
export {
  sanitizeAddress,
  parseBlinkAddress,
  extractUsername,
  isBlinkAddress,
} from './validators';
export type { SanitizeResult, ValidationResult } from './validators';
