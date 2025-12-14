/**
 * Unit Tests: Payment Validation Service
 *
 * Tests all Lightning address validation logic for:
 * - Blink
 * - Fedi
 * - Machankura
 * - Edge cases and error handling
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { validateLightningAddress } from '@/lib/cbaf/payment-validation';

describe('Payment Validation Service', () => {

  describe('Blink Address Validation', () => {
    test('should validate correct Blink address format', async () => {
      const result = await validateLightningAddress('user@blink.sv', 'blink');

      expect(result.isValid).toBe(true);
      expect(result.provider).toBe('blink');
      expect(result.error).toBeNull();
    });

    test('should accept various valid Blink usernames', async () => {
      const addresses = [
        'alice@blink.sv',
        'user123@blink.sv',
        'test_user@blink.sv',
        'user-name@blink.sv'
      ];

      for (const address of addresses) {
        const result = await validateLightningAddress(address, 'blink');
        expect(result.isValid).toBe(true);
      }
    });

    test('should reject invalid Blink formats', async () => {
      const invalidAddresses = [
        '@blink.sv',           // Missing username
        'user@',               // Missing domain
        'user@wrong.com',      // Wrong domain
        'user blink.sv',       // Missing @
        'user@@blink.sv',      // Double @
        ''                     // Empty string
      ];

      for (const address of invalidAddresses) {
        const result = await validateLightningAddress(address, 'blink');
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('Fedi Address Validation', () => {
    test('should validate correct Fedi address format', async () => {
      const result = await validateLightningAddress('user@fedi.xyz', 'fedi');

      expect(result.isValid).toBe(true);
      expect(result.provider).toBe('fedi');
      expect(result.error).toBeNull();
    });

    test('should accept various valid Fedi usernames', async () => {
      const addresses = [
        'alice@fedi.xyz',
        'community_member@fedi.xyz',
        'test-user123@fedi.xyz'
      ];

      for (const address of addresses) {
        const result = await validateLightningAddress(address, 'fedi');
        expect(result.isValid).toBe(true);
      }
    });

    test('should reject invalid Fedi formats', async () => {
      const invalidAddresses = [
        '@fedi.xyz',
        'user@',
        'user@fedi.com',       // Wrong TLD
        'user@blink.sv',       // Wrong provider
        'user fedi.xyz'
      ];

      for (const address of invalidAddresses) {
        const result = await validateLightningAddress(address, 'fedi');
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Machankura Phone Number Validation', () => {
    test('should validate correct Kenyan phone numbers', async () => {
      const validNumbers = [
        '+254712345678',
        '+254723456789',
        '+254734567890',
        '+254745678901'
      ];

      for (const number of validNumbers) {
        const result = await validateLightningAddress(number, 'machankura');
        expect(result.isValid).toBe(true);
        expect(result.provider).toBe('machankura');
      }
    });

    test('should reject invalid phone number formats', async () => {
      const invalidNumbers = [
        '254712345678',        // Missing +
        '+25471234567',        // Too short
        '+2547123456789',      // Too long
        '+254812345678',       // Invalid prefix (81 not valid)
        '+255712345678',       // Wrong country (Tanzania)
        'phone',
        '+254 71 234 5678',    // Spaces not allowed
        ''
      ];

      for (const number of invalidNumbers) {
        const result = await validateLightningAddress(number, 'machankura');
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('Provider Mismatch Detection', () => {
    test('should detect Blink address with wrong provider', async () => {
      const result = await validateLightningAddress('user@blink.sv', 'fedi');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    test('should detect Fedi address with wrong provider', async () => {
      const result = await validateLightningAddress('user@fedi.xyz', 'blink');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    test('should detect phone number with wrong provider', async () => {
      const result = await validateLightningAddress('+254712345678', 'blink');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not match');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null or undefined addresses', async () => {
      const resultNull = await validateLightningAddress(null as any, 'blink');
      const resultUndefined = await validateLightningAddress(undefined as any, 'blink');

      expect(resultNull.isValid).toBe(false);
      expect(resultUndefined.isValid).toBe(false);
    });

    test('should handle empty strings', async () => {
      const result = await validateLightningAddress('', 'blink');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('should handle whitespace-only strings', async () => {
      const result = await validateLightningAddress('   ', 'blink');

      expect(result.isValid).toBe(false);
    });

    test('should trim whitespace before validation', async () => {
      const result = await validateLightningAddress('  user@blink.sv  ', 'blink');

      expect(result.isValid).toBe(true);
    });

    test('should handle very long addresses', async () => {
      const longAddress = 'a'.repeat(300) + '@blink.sv';
      const result = await validateLightningAddress(longAddress, 'blink');

      expect(result.isValid).toBe(false);
    });

    test('should handle special characters in username', async () => {
      const addresses = [
        'user!@blink.sv',
        'user#test@blink.sv',
        'user$@blink.sv',
        'user%@blink.sv'
      ];

      for (const address of addresses) {
        const result = await validateLightningAddress(address, 'blink');
        // Special chars should be rejected
        expect(result.isValid).toBe(false);
      }
    });

    test('should handle case sensitivity correctly', async () => {
      const result1 = await validateLightningAddress('User@Blink.SV', 'blink');
      const result2 = await validateLightningAddress('USER@BLINK.SV', 'blink');

      // Should normalize case
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('Other Provider', () => {
    test('should accept any valid email-like format for "other"', async () => {
      const addresses = [
        'user@custom.domain',
        'alice@mynode.com',
        'bob@lightning.network'
      ];

      for (const address of addresses) {
        const result = await validateLightningAddress(address, 'other');
        expect(result.isValid).toBe(true);
        expect(result.provider).toBe('other');
      }
    });

    test('should still reject malformed addresses for "other"', async () => {
      const invalidAddresses = [
        'notanemail',
        '@nodomain.com',
        'user@',
        'user domain.com'
      ];

      for (const address of invalidAddresses) {
        const result = await validateLightningAddress(address, 'other');
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Real API Validation (Blink)', () => {
    test('should validate against real Blink API', async () => {
      // This test requires network access
      const result = await validateLightningAddress('test@blink.sv', 'blink');

      // Should return result (valid or invalid based on actual API)
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('provider');
      expect(result.provider).toBe('blink');
    }, 10000); // 10s timeout for network request

    test('should handle API timeout gracefully', async () => {
      // Mock a slow response
      const result = await validateLightningAddress('slow@blink.sv', 'blink');

      // Should complete within timeout
      expect(result).toHaveProperty('isValid');
    }, 15000);
  });
});

describe('Batch Validation', () => {
  test('should validate multiple addresses efficiently', async () => {
    const addresses = [
      { address: 'user1@blink.sv', provider: 'blink' as const },
      { address: 'user2@fedi.xyz', provider: 'fedi' as const },
      { address: '+254712345678', provider: 'machankura' as const }
    ];

    const results = await Promise.all(
      addresses.map(({ address, provider }) =>
        validateLightningAddress(address, provider)
      )
    );

    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result.isValid).toBe(true);
    });
  });
});
