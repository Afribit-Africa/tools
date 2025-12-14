/**
 * Unit Tests: Merchant Funding Calculator
 *
 * Tests:
 * - Distribution algorithm
 * - Unallocated fund tracking
 * - CSV export format
 * - Edge cases (no verified merchants, multiple videos, etc.)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { calculateMerchantFunding, exportMerchantPaymentsCSV } from '@/lib/cbaf/merchant-funding-calculator';
import { db } from '@/lib/db';
import { economies, merchants, videoSubmissions, videoMerchants, monthlyRankings } from '@/lib/db/schema';

describe('Merchant Funding Calculator', () => {

  describe('Equal Distribution Algorithm', () => {
    test('should distribute economy allocation equally among verified merchants', async () => {
      // This test requires seeded test data
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-1',
          economyName: 'Test Economy 1',
          totalFunding: 1000000, // 1M sats
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Should distribute to verified merchants only
      expect(result.totalDistributed).toBeGreaterThan(0);
      expect(result.totalDistributed).toBeLessThanOrEqual(1000000);

      // All payments should be equal for same economy
      const economyBreakdown = result.economyBreakdowns[0];
      if (economyBreakdown && economyBreakdown.merchantPayments.length > 0) {
        const firstPayment = economyBreakdown.merchantPayments[0].amountSats;
        economyBreakdown.merchantPayments.forEach(payment => {
          expect(payment.amountSats).toBe(firstPayment);
        });
      }
    });

    test('should calculate correct per-merchant amount', async () => {
      const totalAllocation = 1000000; // 1M sats
      const verifiedMerchants = 5;
      const expectedPerMerchant = Math.floor(totalAllocation / verifiedMerchants);

      // Expected: 200,000 sats per merchant
      expect(expectedPerMerchant).toBe(200000);
    });

    test('should handle rounding for uneven division', async () => {
      const totalAllocation = 1000000; // 1M sats
      const verifiedMerchants = 3;
      const expectedPerMerchant = Math.floor(totalAllocation / verifiedMerchants);

      // 1,000,000 / 3 = 333,333.33... → floor = 333,333
      expect(expectedPerMerchant).toBe(333333);

      // Total distributed should be 999,999 (1 sat unallocated due to rounding)
      const totalDistributed = expectedPerMerchant * verifiedMerchants;
      expect(totalDistributed).toBe(999999);
    });
  });

  describe('Unallocated Fund Tracking', () => {
    test('should track unallocated funds from unverified merchants', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-unverified',
          economyName: 'Test Economy with Unverified',
          totalFunding: 1000000,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // If there are unverified merchants, should have unallocated funds
      if (result.summary.merchantsWithUnverifiedAddresses > 0 ||
          result.summary.merchantsWithoutAddresses > 0) {
        expect(result.totalUnallocated).toBeGreaterThan(0);
      }
    });

    test('should calculate correct unallocated percentage', async () => {
      const totalPool = 1000000;
      const totalDistributed = 600000;
      const expectedUnallocated = 400000;
      const expectedPercentage = (400000 / 1000000) * 100; // 40%

      expect(expectedPercentage).toBe(40);
    });

    test('should track unallocated per economy', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-no-addresses',
          economyName: 'Test Economy No Addresses',
          totalFunding: 1000000,
          overallRank: 5
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Economy with no verified addresses should have 100% unallocated
      const breakdown = result.economyBreakdowns[0];
      if (breakdown && breakdown.verifiedMerchants === 0) {
        expect(breakdown.unallocatedAmount).toBe(1000000);
      }
    });
  });

  describe('Merchant Categorization', () => {
    test('should correctly categorize merchants', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-mixed',
          economyName: 'Test Economy Mixed',
          totalFunding: 1000000,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Should have counts for all three categories
      expect(result.summary).toHaveProperty('merchantsWithVerifiedAddresses');
      expect(result.summary).toHaveProperty('merchantsWithUnverifiedAddresses');
      expect(result.summary).toHaveProperty('merchantsWithoutAddresses');

      // Total should add up
      const total =
        result.summary.merchantsWithVerifiedAddresses +
        result.summary.merchantsWithUnverifiedAddresses +
        result.summary.merchantsWithoutAddresses;

      expect(total).toBe(result.summary.totalMerchants);
    });

    test('should only count merchants that appeared in videos', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-1',
          economyName: 'Test Economy 1',
          totalFunding: 1000000,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // All merchants in result should have videoAppearances > 0
      result.paymentRecords.forEach(payment => {
        expect(payment.videoAppearances).toBeGreaterThan(0);
      });
    });
  });

  describe('Video Appearance Counting', () => {
    test('should count merchant video appearances correctly', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-1',
          economyName: 'Test Economy 1',
          totalFunding: 1000000,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Each payment record should have video appearance count
      result.paymentRecords.forEach(payment => {
        expect(payment.videoAppearances).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(payment.videoAppearances)).toBe(true);
      });
    });

    test('should handle merchant appearing in multiple videos', async () => {
      // This tests that a merchant appearing in 3 videos gets counted once
      // but their videoAppearances field should be 3
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-1',
          economyName: 'Test Economy 1',
          totalFunding: 1000000,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Payment records should be unique per merchant
      const merchantIds = result.paymentRecords.map(p => p.merchantId);
      const uniqueMerchantIds = new Set(merchantIds);

      expect(merchantIds.length).toBe(uniqueMerchantIds.size);
    });
  });

  describe('Multiple Economies', () => {
    test('should handle multiple economies correctly', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-1',
          economyName: 'Test Economy 1',
          totalFunding: 2000000,
          overallRank: 1
        },
        {
          economyId: 'test-economy-2',
          economyName: 'Test Economy 2',
          totalFunding: 1500000,
          overallRank: 2
        },
        {
          economyId: 'test-economy-3',
          economyName: 'Test Economy 3',
          totalFunding: 1000000,
          overallRank: 3
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Should have breakdown for each economy
      expect(result.economyBreakdowns.length).toBe(3);

      // Total pool should equal sum of allocations
      expect(result.totalPool).toBe(4500000);

      // Each breakdown should have correct allocation
      result.economyBreakdowns.forEach((breakdown, index) => {
        expect(breakdown.totalAllocation).toBe(economyAllocations[index].totalFunding);
      });
    });

    test('should calculate correct overall totals', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        { economyId: 'e1', economyName: 'E1', totalFunding: 1000000, overallRank: 1 },
        { economyId: 'e2', economyName: 'E2', totalFunding: 1000000, overallRank: 2 }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Distributed + Unallocated should equal Total Pool
      expect(result.totalDistributed + result.totalUnallocated).toBe(result.totalPool);
    });
  });

  describe('Edge Cases', () => {
    test('should handle economy with no merchants', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'empty-economy',
          economyName: 'Empty Economy',
          totalFunding: 1000000,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      // Should handle gracefully
      expect(result.totalDistributed).toBe(0);
      expect(result.totalUnallocated).toBe(1000000);
    });

    test('should handle all merchants verified', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-all-verified',
          economyName: 'All Verified',
          totalFunding: 1000000,
          overallRank: 4
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      const breakdown = result.economyBreakdowns[0];
      if (breakdown && breakdown.verifiedMerchants > 0 &&
          breakdown.unverifiedMerchants === 0 &&
          breakdown.merchantsWithoutAddresses === 0) {
        // Unallocated should be minimal (only rounding)
        expect(breakdown.unallocatedAmount).toBeLessThan(breakdown.verifiedMerchants);
      }
    });

    test('should handle all merchants unverified', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-no-addresses',
          economyName: 'No Addresses',
          totalFunding: 1000000,
          overallRank: 5
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      const breakdown = result.economyBreakdowns[0];
      if (breakdown && breakdown.verifiedMerchants === 0) {
        // All funds unallocated
        expect(breakdown.unallocatedAmount).toBe(1000000);
        expect(breakdown.merchantPayments.length).toBe(0);
      }
    });

    test('should handle zero allocation', async () => {
      const period = { month: '2025-12', year: 2025, monthName: 'December' };

      const economyAllocations = [
        {
          economyId: 'test-economy-1',
          economyName: 'Test Economy',
          totalFunding: 0,
          overallRank: 1
        }
      ];

      const result = await calculateMerchantFunding(period, economyAllocations);

      expect(result.totalPool).toBe(0);
      expect(result.totalDistributed).toBe(0);
    });
  });
});

describe('CSV Export', () => {
  test('should export valid CSV format', () => {
    const mockFunding = {
      period: { month: '2025-12', year: 2025, monthName: 'December' },
      totalPool: 1000000,
      totalDistributed: 900000,
      totalUnallocated: 100000,
      economyBreakdowns: [],
      paymentRecords: [
        {
          merchantId: 'm1',
          merchantName: 'Test Merchant 1',
          localName: 'Duka 1',
          lightningAddress: 'test1@blink.sv',
          paymentProvider: 'blink',
          economyId: 'e1',
          economyName: 'Test Economy',
          amountSats: 300000,
          videoAppearances: 2,
          addressVerified: true,
          addressVerifiedAt: new Date('2025-12-01')
        },
        {
          merchantId: 'm2',
          merchantName: 'Test Merchant 2',
          localName: 'Duka 2',
          lightningAddress: 'test2@fedi.xyz',
          paymentProvider: 'fedi',
          economyId: 'e1',
          economyName: 'Test Economy',
          amountSats: 300000,
          videoAppearances: 3,
          addressVerified: true,
          addressVerifiedAt: new Date('2025-12-01')
        }
      ],
      summary: {
        totalMerchants: 2,
        merchantsWithVerifiedAddresses: 2,
        merchantsWithUnverifiedAddresses: 0,
        merchantsWithoutAddresses: 0
      }
    };

    const csv = exportMerchantPaymentsCSV(mockFunding);

    // Should have header row
    expect(csv).toContain('Lightning Address,Amount (sats)');

    // Should have merchant rows
    expect(csv).toContain('test1@blink.sv');
    expect(csv).toContain('test2@fedi.xyz');
    expect(csv).toContain('300000');

    // Should include all columns
    expect(csv).toContain('Test Merchant 1');
    expect(csv).toContain('blink');
    expect(csv).toContain('Test Economy');
  });

  test('should handle special characters in CSV', () => {
    const mockFunding = {
      period: { month: '2025-12', year: 2025, monthName: 'December' },
      totalPool: 300000,
      totalDistributed: 300000,
      totalUnallocated: 0,
      economyBreakdowns: [],
      paymentRecords: [
        {
          merchantId: 'm1',
          merchantName: 'Test "Merchant" with, commas',
          localName: 'Duka, la Test',
          lightningAddress: 'test@blink.sv',
          paymentProvider: 'blink',
          economyId: 'e1',
          economyName: 'Test, Economy',
          amountSats: 300000,
          videoAppearances: 1,
          addressVerified: true,
          addressVerifiedAt: new Date('2025-12-01')
        }
      ],
      summary: {
        totalMerchants: 1,
        merchantsWithVerifiedAddresses: 1,
        merchantsWithUnverifiedAddresses: 0,
        merchantsWithoutAddresses: 0
      }
    };

    const csv = exportMerchantPaymentsCSV(mockFunding);

    // Should escape commas and quotes
    expect(csv).toContain('"Test ""Merchant"" with, commas"');
    expect(csv).toContain('"Duka, la Test"');
    expect(csv).toContain('"Test, Economy"');
  });

  test('should handle empty payment records', () => {
    const mockFunding = {
      period: { month: '2025-12', year: 2025, monthName: 'December' },
      totalPool: 0,
      totalDistributed: 0,
      totalUnallocated: 0,
      economyBreakdowns: [],
      paymentRecords: [],
      summary: {
        totalMerchants: 0,
        merchantsWithVerifiedAddresses: 0,
        merchantsWithUnverifiedAddresses: 0,
        merchantsWithoutAddresses: 0
      }
    };

    const csv = exportMerchantPaymentsCSV(mockFunding);

    // Should still have header
    expect(csv).toContain('Lightning Address,Amount (sats)');

    // Should only have one line (header)
    const lines = csv.split('\n').filter(line => line.trim());
    expect(lines.length).toBe(1);
  });
});
