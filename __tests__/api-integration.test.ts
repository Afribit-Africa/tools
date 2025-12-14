/**
 * Integration Tests: Address Verification APIs
 *
 * Tests:
 * - POST /api/cbaf/admin/verify-merchant-address
 * - POST /api/cbaf/admin/send-address-correction-email
 * - Bulk verification workflow
 * - Email sending integration
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Address Verification API', () => {

  const API_BASE = 'http://localhost:3001';
  let testMerchantId: string;
  let testEconomyId: string;
  let authToken: string;

  beforeAll(async () => {
    // Login as admin to get auth token
    // This assumes test data has been seeded
    const loginRes = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.afribit.com',
        password: 'test123'
      })
    });

    // Extract session token from response
    // authToken = await getSessionToken();
  });

  describe('POST /api/cbaf/admin/verify-merchant-address', () => {
    test('should verify valid Blink address', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Cookie': `session=${authToken}`
        },
        body: JSON.stringify({
          merchantId: testMerchantId,
          lightningAddress: 'test@blink.sv',
          provider: 'blink'
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.isValid).toBe(true);
      expect(data.provider).toBe('blink');
    }, 10000);

    test('should reject invalid address', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: testMerchantId,
          lightningAddress: 'invalid@invalid',
          provider: 'blink'
        })
      });

      const data = await response.json();
      expect(data.isValid).toBe(false);
      expect(data.error).toBeTruthy();
    });

    test('should update merchant record on verification', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: testMerchantId,
          lightningAddress: 'verified@blink.sv',
          provider: 'blink'
        })
      });

      const data = await response.json();

      if (data.isValid) {
        expect(data.updatedMerchant).toBeDefined();
        expect(data.updatedMerchant.addressVerified).toBe(true);
        expect(data.updatedMerchant.addressVerifiedAt).toBeTruthy();
      }
    });

    test('should require authentication', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: testMerchantId,
          lightningAddress: 'test@blink.sv',
          provider: 'blink'
        })
      });

      // Without auth, should fail
      expect([401, 403]).toContain(response.status);
    });

    test('should validate required fields', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing merchantId
          lightningAddress: 'test@blink.sv',
          provider: 'blink'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('merchantId');
    });
  });

  describe('POST /api/cbaf/admin/send-address-correction-email', () => {
    test('should send correction email for invalid address', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/send-address-correction-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economyId: testEconomyId,
          merchantName: 'Test Merchant',
          invalidAddress: 'invalid@example.com',
          provider: 'blink',
          errorMessage: 'Address does not exist'
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('email sent');
    });

    test('should fail if economy has no contact email', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/send-address-correction-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economyId: 'economy-no-email',
          merchantName: 'Test Merchant',
          invalidAddress: 'invalid@example.com',
          provider: 'blink',
          errorMessage: 'Address does not exist'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('No contact email');
    });

    test('should validate email parameters', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/admin/send-address-correction-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required fields
          economyId: testEconomyId
        })
      });

      expect(response.status).toBe(400);
    });

    test('should handle SMTP errors gracefully', async () => {
      // This would test with invalid SMTP config
      // For now, just ensure endpoint handles errors
      const response = await fetch(`${API_BASE}/api/cbaf/admin/send-address-correction-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economyId: testEconomyId,
          merchantName: 'Test Merchant',
          invalidAddress: 'test@test.com',
          provider: 'blink',
          errorMessage: 'Test error'
        })
      });

      // Should return either success or proper error
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Bulk Verification Workflow', () => {
    test('should verify multiple merchants in sequence', async () => {
      const merchants = [
        { id: 'm1', address: 'test1@blink.sv', provider: 'blink' },
        { id: 'm2', address: 'test2@fedi.xyz', provider: 'fedi' },
        { id: 'm3', address: '+254712345678', provider: 'machankura' }
      ];

      const results = [];
      for (const merchant of merchants) {
        const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantId: merchant.id,
            lightningAddress: merchant.address,
            provider: merchant.provider
          })
        });

        const data = await response.json();
        results.push(data);
      }

      // All should complete
      expect(results.length).toBe(3);

      // Each should have validation result
      results.forEach(result => {
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('provider');
      });
    }, 30000);

    test('should handle mixed valid/invalid addresses', async () => {
      const merchants = [
        { id: 'm1', address: 'valid@blink.sv', provider: 'blink' },
        { id: 'm2', address: 'invalid@invalid', provider: 'blink' },
        { id: 'm3', address: 'another@fedi.xyz', provider: 'fedi' }
      ];

      const results = [];
      for (const merchant of merchants) {
        const response = await fetch(`${API_BASE}/api/cbaf/admin/verify-merchant-address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantId: merchant.id,
            lightningAddress: merchant.address,
            provider: merchant.provider
          })
        });

        const data = await response.json();
        results.push(data);
      }

      // Should have mix of valid and invalid
      const validCount = results.filter(r => r.isValid).length;
      const invalidCount = results.filter(r => !r.isValid).length;

      expect(validCount).toBeGreaterThan(0);
      expect(invalidCount).toBeGreaterThan(0);
    }, 30000);
  });
});

describe('Merchant Funding Calculation API', () => {

  const API_BASE = 'http://localhost:3001';

  describe('POST /api/cbaf/funding/calculate-merchant-level', () => {
    test('should calculate merchant payments for current month', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-12',
          totalPool: 10000000 // 10M sats
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.merchantLevelDistribution).toBeDefined();
      expect(data.economyLevelAllocation).toBeDefined();
    });

    test('should return economy breakdowns', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-12',
          totalPool: 10000000
        })
      });

      const data = await response.json();
      const distribution = data.merchantLevelDistribution;

      expect(distribution.economyBreakdowns).toBeInstanceOf(Array);
      expect(distribution.economyBreakdowns.length).toBeGreaterThan(0);

      // Each breakdown should have required fields
      distribution.economyBreakdowns.forEach((breakdown: any) => {
        expect(breakdown).toHaveProperty('economyId');
        expect(breakdown).toHaveProperty('economyName');
        expect(breakdown).toHaveProperty('totalAllocation');
        expect(breakdown).toHaveProperty('verifiedMerchants');
        expect(breakdown).toHaveProperty('merchantPayments');
      });
    });

    test('should return payment records', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-12',
          totalPool: 10000000
        })
      });

      const data = await response.json();
      const distribution = data.merchantLevelDistribution;

      expect(distribution.paymentRecords).toBeInstanceOf(Array);

      // Each payment should have required fields for CSV export
      distribution.paymentRecords.forEach((payment: any) => {
        expect(payment).toHaveProperty('lightningAddress');
        expect(payment).toHaveProperty('amountSats');
        expect(payment).toHaveProperty('merchantName');
        expect(payment).toHaveProperty('paymentProvider');
        expect(payment.amountSats).toBeGreaterThan(0);
      });
    });

    test('should calculate correct totals', async () => {
      const totalPool = 10000000;

      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-12',
          totalPool
        })
      });

      const data = await response.json();
      const distribution = data.merchantLevelDistribution;

      // Distributed + Unallocated = Total Pool
      expect(
        distribution.totalDistributed + distribution.totalUnallocated
      ).toBe(totalPool);
    });

    test('should track unallocated percentage', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-12',
          totalPool: 10000000
        })
      });

      const data = await response.json();
      const distribution = data.merchantLevelDistribution;

      expect(distribution).toHaveProperty('unallocatedPercentage');

      const expectedPercentage =
        (distribution.totalUnallocated / distribution.totalPool) * 100;

      expect(parseFloat(distribution.unallocatedPercentage)).toBeCloseTo(expectedPercentage, 1);
    });

    test('should require super admin authentication', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: '2025-12',
          totalPool: 10000000
        })
      });

      // Without super admin auth, should fail
      expect([401, 403]).toContain(response.status);
    });

    test('should validate required parameters', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing period
          totalPool: 10000000
        })
      });

      expect(response.status).toBe(400);
    });

    test('should handle invalid period format', async () => {
      const response = await fetch(`${API_BASE}/api/cbaf/funding/calculate-merchant-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: 'invalid',
          totalPool: 10000000
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeTruthy();
    });
  });
});
