/**
 * CBAF Funding Calculator
 *
 * Calculates funding allocation based on monthly rankings and generates
 * payment data for bulk disbursement via Fastlight
 */

import { db } from '@/lib/db';
import { monthlyRankings, economies, fundingDisbursements } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RankingPeriod } from './ranking-calculator';

export interface FundingAllocation {
  economyId: string;
  economyName: string;
  lightningAddress: string | null;

  // Ranking data
  overallRank: number;
  videosApproved: number;
  merchantsTotal: number;
  merchantsNew: number;

  // Funding calculation
  baseAllocation: number;
  rankBonus: number;
  performanceBonus: number;
  totalFunding: number;
}

export interface FundingPool {
  totalPool: number;
  baseAmount: number;
  rankBonusPool: number;
  performanceBonusPool: number;
  allocations: FundingAllocation[];
}

export interface PaymentRecord {
  lightningAddress: string;
  amountSats: number;
  economyName: string;
  economyId: string;
  rank: number;
  note: string;
}

/**
 * Default funding pool configuration (in satoshis)
 * These can be adjusted based on available budget
 */
export const DEFAULT_FUNDING_CONFIG = {
  totalPool: 10_000_000, // 10M sats = ~$3,500 at $35k/BTC
  baseAmount: 100_000, // 100k sats base for all participants
  rankBonusPool: 5_000_000, // 5M sats distributed by rank
  performanceBonusPool: 4_900_000, // Remaining for performance metrics
};

/**
 * Calculate funding allocation based on rankings
 */
export async function calculateFundingAllocation(
  period: RankingPeriod,
  config = DEFAULT_FUNDING_CONFIG
): Promise<FundingPool> {
  // Get rankings for the period
  const [year, month] = period.month.split('-').map(Number);

  const rankings = await db
    .select({
      ranking: monthlyRankings,
      economy: economies,
    })
    .from(monthlyRankings)
    .leftJoin(economies, eq(monthlyRankings.economyId, economies.id))
    .where(
      and(
        eq(monthlyRankings.month, period.month),
        eq(monthlyRankings.year, year)
      )
    )
    .orderBy(monthlyRankings.overallRank);

  if (rankings.length === 0) {
    throw new Error(`No rankings found for ${period.monthName} ${period.year}`);
  }

  const totalEconomies = rankings.length;

  // Calculate allocations
  const allocations: FundingAllocation[] = rankings.map(({ ranking, economy }, index) => {
    if (!economy) {
      throw new Error(`Economy not found for ranking ${ranking.id}`);
    }

    // Base allocation: equal for all
    const baseAllocation = config.baseAmount;

    // Rank bonus: inverse proportion (rank 1 gets most, last gets least)
    // Using harmonic series for fair distribution
    const rankWeight = 1 / ranking.overallRank!;
    const totalRankWeight = rankings.reduce((sum, _, i) => sum + (1 / (i + 1)), 0);
    const rankBonus = Math.floor((rankWeight / totalRankWeight) * config.rankBonusPool);

    // Performance bonus: based on metrics
    const videosWeight = (ranking.videosApproved || 0) * 0.4;
    const merchantsWeight = (ranking.merchantsTotal || 0) * 0.3;
    const newMerchantsWeight = (ranking.merchantsNew || 0) * 0.3 * 2; // 2x for new discoveries

    const performanceScore = videosWeight + merchantsWeight + newMerchantsWeight;
    const totalPerformanceScore = rankings.reduce((sum, { ranking: r }) => {
      const vw = (r.videosApproved || 0) * 0.4;
      const mw = (r.merchantsTotal || 0) * 0.3;
      const nmw = (r.merchantsNew || 0) * 0.3 * 2;
      return sum + vw + mw + nmw;
    }, 0);

    const performanceBonus = totalPerformanceScore > 0
      ? Math.floor((performanceScore / totalPerformanceScore) * config.performanceBonusPool)
      : 0;

    // Total funding
    const totalFunding = baseAllocation + rankBonus + performanceBonus;

    return {
      economyId: ranking.economyId,
      economyName: economy.economyName,
      lightningAddress: economy.lightningAddress,
      overallRank: ranking.overallRank!,
      videosApproved: ranking.videosApproved || 0,
      merchantsTotal: ranking.merchantsTotal || 0,
      merchantsNew: ranking.merchantsNew || 0,
      baseAllocation,
      rankBonus,
      performanceBonus,
      totalFunding,
    };
  });

  // Calculate actual totals
  const actualTotal = allocations.reduce((sum, a) => sum + a.totalFunding, 0);

  return {
    totalPool: actualTotal,
    baseAmount: config.baseAmount,
    rankBonusPool: config.rankBonusPool,
    performanceBonusPool: config.performanceBonusPool,
    allocations,
  };
}

/**
 * Generate payment records for Fastlight CSV export
 */
export function generatePaymentRecords(
  fundingPool: FundingPool,
  period: RankingPeriod
): PaymentRecord[] {
  return fundingPool.allocations
    .filter(allocation => allocation.lightningAddress) // Only include economies with Lightning addresses
    .map(allocation => ({
      lightningAddress: allocation.lightningAddress!,
      amountSats: allocation.totalFunding,
      economyName: allocation.economyName,
      economyId: allocation.economyId,
      rank: allocation.overallRank,
      note: `CBAF ${period.monthName} ${period.year} - Rank #${allocation.overallRank}`,
    }));
}

/**
 * Generate CSV content for Fastlight import
 */
export function generateCSV(paymentRecords: PaymentRecord[]): string {
  const headers = ['Lightning Address', 'Amount (sats)', 'Note'];
  const rows = paymentRecords.map(record => [
    record.lightningAddress,
    record.amountSats.toString(),
    record.note,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Save funding disbursements to database
 */
export async function saveFundingDisbursements(
  fundingPool: FundingPool,
  period: RankingPeriod,
  initiatedBy: string
): Promise<void> {
  const [year, month] = period.month.split('-').map(Number);

  // Create disbursement records
  const disbursements = fundingPool.allocations.map(allocation => ({
    economyId: allocation.economyId,
    amountSats: allocation.totalFunding,
    amountUsd: null, // Could calculate based on current BTC price
    fundingMonth: period.month,
    fundingYear: year,
    videosApproved: allocation.videosApproved,
    merchantsInvolved: allocation.merchantsTotal,
    newMerchants: allocation.merchantsNew,
    paymentMethod: allocation.lightningAddress ? ('lightning' as const) : ('manual' as const),
    lightningInvoice: null,
    paymentHash: null,
    transactionId: null,
    status: 'pending' as const,
    errorMessage: null,
    initiatedBy,
    approvedBy: null,
    createdAt: new Date(),
    processedAt: null,
    completedAt: null,
  }));

  // Insert into database
  await db.insert(fundingDisbursements).values(disbursements);

  // Update monthly rankings with funding amounts
  for (const allocation of fundingPool.allocations) {
    await db
      .update(monthlyRankings)
      .set({ fundingEarned: allocation.totalFunding })
      .where(
        and(
          eq(monthlyRankings.economyId, allocation.economyId),
          eq(monthlyRankings.month, period.month),
          eq(monthlyRankings.year, year)
        )
      );
  }
}

/**
 * Get funding disbursements for a period
 */
export async function getFundingDisbursements(period: RankingPeriod) {
  const [year] = period.month.split('-').map(Number);

  const results = await db
    .select({
      disbursement: fundingDisbursements,
      economy: economies,
    })
    .from(fundingDisbursements)
    .leftJoin(economies, eq(fundingDisbursements.economyId, economies.id))
    .where(
      and(
        eq(fundingDisbursements.fundingMonth, period.month),
        eq(fundingDisbursements.fundingYear, year)
      )
    );

  return results.map(({ disbursement, economy }) => ({
    ...disbursement,
    economyName: economy?.economyName || 'Unknown',
  }));
}

/**
 * Update disbursement status after payment
 */
export async function updateDisbursementStatus(
  disbursementId: string,
  status: 'processing' | 'completed' | 'failed',
  paymentDetails?: {
    paymentHash?: string;
    transactionId?: string;
    errorMessage?: string;
  }
) {
  const updateData: any = {
    status,
    processedAt: new Date(),
  };

  if (status === 'completed') {
    updateData.completedAt = new Date();
  }

  if (paymentDetails) {
    if (paymentDetails.paymentHash) updateData.paymentHash = paymentDetails.paymentHash;
    if (paymentDetails.transactionId) updateData.transactionId = paymentDetails.transactionId;
    if (paymentDetails.errorMessage) updateData.errorMessage = paymentDetails.errorMessage;
  }

  await db
    .update(fundingDisbursements)
    .set(updateData)
    .where(eq(fundingDisbursements.id, disbursementId));
}
