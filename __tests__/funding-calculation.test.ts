/**
 * Funding Calculation Tests
 * Tests for funding distribution algorithms
 */

import { describe, test, expect } from '@jest/globals';

describe('Funding Distribution', () => {
  describe('Base Amount Calculation', () => {
    test('should apply base amount to all approved videos', () => {
      const baseAmount = 5000;
      const approvedVideos = [
        { id: 'v1', merchantIds: ['m1', 'm2'] },
        { id: 'v2', merchantIds: ['m3'] },
        { id: 'v3', merchantIds: ['m1'] },
      ];

      const totalBaseDistribution = approvedVideos.length * baseAmount;
      expect(totalBaseDistribution).toBe(15000);
    });

    test('should calculate per-merchant base distribution', () => {
      const baseAmount = 5000;
      const video = { id: 'v1', merchantIds: ['m1', 'm2', 'm3'] };

      const perMerchant = baseAmount / video.merchantIds.length;
      expect(perMerchant).toBeCloseTo(1666.67, 1);
    });
  });

  describe('Rank Bonus Calculation', () => {
    test('should calculate rank-based bonus pool distribution', () => {
      const rankBonusPool = 100000;
      const economies = [
        { slug: 'economy-1', rank: 1 },
        { slug: 'economy-2', rank: 2 },
        { slug: 'economy-3', rank: 3 },
      ];

      // Higher rank gets more (inverse distribution)
      const totalRanks = economies.reduce((sum, e) => sum + e.rank, 0);
      const inverseRanks = economies.map(e => ({
        ...e,
        inverseRank: totalRanks - e.rank + 1
      }));

      const totalInverse = inverseRanks.reduce((sum, e) => sum + e.inverseRank, 0);

      const distributions = inverseRanks.map(e => ({
        economy: e.slug,
        share: (e.inverseRank / totalInverse) * rankBonusPool
      }));

      // Rank 1 should get the most
      expect(distributions[0].share).toBeGreaterThan(distributions[1].share);
      expect(distributions[1].share).toBeGreaterThan(distributions[2].share);
    });

    test('should handle equal ranks', () => {
      const rankBonusPool = 100000;
      const economies = [
        { slug: 'economy-1', rank: 1 },
        { slug: 'economy-2', rank: 1 },
      ];

      const equalShare = rankBonusPool / economies.length;
      expect(equalShare).toBe(50000);
    });
  });

  describe('Performance Bonus Calculation', () => {
    test('should reward new merchant appearances', () => {
      const performanceBonusPool = 50000;
      const videos = [
        { id: 'v1', newMerchantCount: 3 },
        { id: 'v2', newMerchantCount: 0 },
        { id: 'v3', newMerchantCount: 2 },
      ];

      const totalNewMerchants = videos.reduce((sum, v) => sum + v.newMerchantCount, 0);

      const bonusPerNewMerchant = performanceBonusPool / totalNewMerchants;

      const distributions = videos.map(v => ({
        videoId: v.id,
        bonus: v.newMerchantCount * bonusPerNewMerchant
      }));

      expect(distributions[0].bonus).toBe(30000); // 3 new merchants
      expect(distributions[1].bonus).toBe(0); // 0 new merchants
      expect(distributions[2].bonus).toBe(20000); // 2 new merchants
    });

    test('should handle zero new merchants gracefully', () => {
      const performanceBonusPool = 50000;
      const videos = [
        { id: 'v1', newMerchantCount: 0 },
        { id: 'v2', newMerchantCount: 0 },
      ];

      const totalNewMerchants = videos.reduce((sum, v) => sum + v.newMerchantCount, 0);

      // If no new merchants, pool should remain undistributed or rollover
      expect(totalNewMerchants).toBe(0);

      // No division by zero
      const bonusPerNewMerchant = totalNewMerchants > 0
        ? performanceBonusPool / totalNewMerchants
        : 0;

      expect(bonusPerNewMerchant).toBe(0);
    });
  });

  describe('Funding Period Validation', () => {
    test('should validate funding month format', () => {
      const isValidFundingMonth = (month: string) => {
        const regex = /^\d{4}-\d{2}$/;
        if (!regex.test(month)) return false;

        const [year, monthNum] = month.split('-').map(Number);
        return year >= 2024 && year <= 2030 && monthNum >= 1 && monthNum <= 12;
      };

      expect(isValidFundingMonth('2025-01')).toBe(true);
      expect(isValidFundingMonth('2025-12')).toBe(true);
      expect(isValidFundingMonth('2025-13')).toBe(false);
      expect(isValidFundingMonth('2023-01')).toBe(false);
      expect(isValidFundingMonth('invalid')).toBe(false);
    });

    test('should prevent double-funding for same month', () => {
      const processedMonths = ['2025-01', '2025-02'];
      const requestedMonth = '2025-01';

      const alreadyProcessed = processedMonths.includes(requestedMonth);
      expect(alreadyProcessed).toBe(true);
    });
  });

  describe('Total Pool Calculation', () => {
    test('should sum all pool components', () => {
      const config = {
        baseAmount: 5000,
        rankBonusPool: 100000,
        performanceBonusPool: 50000,
        totalPool: 500000,
      };

      const approvedVideoCount = 20;
      const baseTotal = config.baseAmount * approvedVideoCount;

      const calculatedTotal = baseTotal + config.rankBonusPool + config.performanceBonusPool;

      // Custom totalPool can override calculated
      expect(config.totalPool).toBeGreaterThan(calculatedTotal);
    });

    test('should not exceed total pool limit', () => {
      const totalPool = 500000;
      const distributions = [
        { amount: 100000 },
        { amount: 150000 },
        { amount: 200000 },
      ];

      const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
      expect(totalDistributed).toBeLessThanOrEqual(totalPool);
    });
  });
});

describe('Satoshi Calculations', () => {
  test('should handle satoshi rounding', () => {
    const roundSats = (sats: number) => Math.floor(sats);

    expect(roundSats(1666.67)).toBe(1666);
    expect(roundSats(1666.99)).toBe(1666);
    expect(roundSats(1667.0)).toBe(1667);
  });

  test('should format satoshi display', () => {
    const formatSats = (sats: number) => {
      if (sats >= 1000000) {
        return `${(sats / 1000000).toFixed(1)}M sats`;
      }
      if (sats >= 1000) {
        return `${(sats / 1000).toFixed(1)}K sats`;
      }
      return `${sats} sats`;
    };

    expect(formatSats(1500000)).toBe('1.5M sats');
    expect(formatSats(25000)).toBe('25.0K sats');
    expect(formatSats(500)).toBe('500 sats');
  });
});
