/**
 * CBAF Ranking Calculator
 * 
 * Calculates monthly rankings for Bitcoin circular economies based on:
 * - Number of approved videos
 * - Total merchants featured
 * - New merchants discovered
 * - Approval rate
 */

import { db } from '@/lib/db';
import { 
  economies, 
  videoSubmissions, 
  videoMerchants, 
  merchants, 
  monthlyRankings 
} from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

export interface EconomyMetrics {
  economyId: string;
  economyName: string;
  
  // Video metrics
  videosSubmitted: number;
  videosApproved: number;
  videosRejected: number;
  approvalRate: number;
  
  // Merchant metrics
  merchantsTotal: number;
  merchantsNew: number;
  merchantsReturning: number;
  
  // Raw scores (before ranking)
  videoScore: number;
  merchantScore: number;
  newMerchantScore: number;
  overallScore: number;
}

export interface EconomyRanking extends EconomyMetrics {
  rankByVideos: number;
  rankByMerchants: number;
  rankByNewMerchants: number;
  overallRank: number;
}

export interface RankingPeriod {
  month: string; // Format: "YYYY-MM"
  year: number;
  monthName: string;
}

/**
 * Get the current ranking period (current month)
 */
export function getCurrentPeriod(): RankingPeriod {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    month: `${year}-${month}`,
    year,
    monthName: monthNames[now.getMonth()],
  };
}

/**
 * Get a specific ranking period
 */
export function getPeriod(year: number, month: number): RankingPeriod {
  const monthStr = String(month).padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    month: `${year}-${monthStr}`,
    year,
    monthName: monthNames[month - 1],
  };
}

/**
 * Calculate metrics for a single economy for a given period
 */
async function calculateEconomyMetrics(
  economyId: string,
  period: RankingPeriod
): Promise<EconomyMetrics | null> {
  // Get economy info
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, economyId),
  });

  if (!economy) return null;

  // Calculate date range for the period
  const [year, month] = period.month.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Get video statistics
  const videoStats = await db
    .select({
      submitted: sql<number>`count(*)::int`,
      approved: sql<number>`count(*) filter (where ${videoSubmissions.status} = 'approved')::int`,
      rejected: sql<number>`count(*) filter (where ${videoSubmissions.status} = 'rejected')::int`,
    })
    .from(videoSubmissions)
    .where(
      and(
        eq(videoSubmissions.economyId, economyId),
        gte(videoSubmissions.submittedAt, startDate),
        lte(videoSubmissions.submittedAt, endDate)
      )
    );

  const { submitted, approved, rejected } = videoStats[0] || { submitted: 0, approved: 0, rejected: 0 };
  const approvalRate = submitted > 0 ? (approved / submitted) * 100 : 0;

  // Get approved video IDs for this period
  const approvedVideos = await db
    .select({ id: videoSubmissions.id })
    .from(videoSubmissions)
    .where(
      and(
        eq(videoSubmissions.economyId, economyId),
        eq(videoSubmissions.status, 'approved'),
        gte(videoSubmissions.submittedAt, startDate),
        lte(videoSubmissions.submittedAt, endDate)
      )
    );

  const approvedVideoIds = approvedVideos.map(v => v.id);

  // Count unique merchants in approved videos
  let merchantsTotal = 0;
  let merchantsNew = 0;
  let merchantsReturning = 0;

  if (approvedVideoIds.length > 0) {
    // Get unique merchants from approved videos
    const merchantsInVideos = await db
      .selectDistinct({ merchantId: videoMerchants.merchantId })
      .from(videoMerchants)
      .where(sql`${videoMerchants.videoId} = ANY(${approvedVideoIds})`);

    merchantsTotal = merchantsInVideos.length;

    // Check which merchants are new (first appearance in this period)
    for (const { merchantId } of merchantsInVideos) {
      const merchant = await db.query.merchants.findFirst({
        where: eq(merchants.id, merchantId),
      });

      if (!merchant) continue;

      // Check if this is the merchant's first appearance
      const firstAppearance = merchant.firstAppearanceDate;
      
      if (firstAppearance && firstAppearance >= startDate && firstAppearance <= endDate) {
        merchantsNew++;
      } else {
        merchantsReturning++;
      }
    }
  }

  // Calculate scores
  // Video score: weighted by approval rate
  const videoScore = approved * (1 + approvalRate / 100);
  
  // Merchant score: total merchants featured
  const merchantScore = merchantsTotal;
  
  // New merchant score: heavily weighted to encourage discovery
  const newMerchantScore = merchantsNew * 2;
  
  // Overall score: weighted combination
  const overallScore = (videoScore * 0.4) + (merchantScore * 0.3) + (newMerchantScore * 0.3);

  return {
    economyId,
    economyName: economy.economyName,
    videosSubmitted: submitted,
    videosApproved: approved,
    videosRejected: rejected,
    approvalRate: Math.round(approvalRate * 100) / 100,
    merchantsTotal,
    merchantsNew,
    merchantsReturning,
    videoScore,
    merchantScore,
    newMerchantScore,
    overallScore,
  };
}

/**
 * Calculate rankings for all economies for a given period
 */
export async function calculateRankings(period: RankingPeriod): Promise<EconomyRanking[]> {
  // Get all active economies
  const allEconomies = await db.query.economies.findMany({
    where: eq(economies.isActive, true),
  });

  // Calculate metrics for each economy
  const metricsPromises = allEconomies.map(economy =>
    calculateEconomyMetrics(economy.id, period)
  );

  const allMetrics = (await Promise.all(metricsPromises)).filter(
    (m): m is EconomyMetrics => m !== null
  );

  // Sort and rank by different criteria
  
  // Rank by approved videos
  const byVideos = [...allMetrics].sort((a, b) => b.videosApproved - a.videosApproved);
  const videoRanks = new Map<string, number>();
  byVideos.forEach((m, idx) => videoRanks.set(m.economyId, idx + 1));

  // Rank by total merchants
  const byMerchants = [...allMetrics].sort((a, b) => b.merchantsTotal - a.merchantsTotal);
  const merchantRanks = new Map<string, number>();
  byMerchants.forEach((m, idx) => merchantRanks.set(m.economyId, idx + 1));

  // Rank by new merchants
  const byNewMerchants = [...allMetrics].sort((a, b) => b.merchantsNew - a.merchantsNew);
  const newMerchantRanks = new Map<string, number>();
  byNewMerchants.forEach((m, idx) => newMerchantRanks.set(m.economyId, idx + 1));

  // Rank by overall score
  const byOverall = [...allMetrics].sort((a, b) => b.overallScore - a.overallScore);
  const overallRanks = new Map<string, number>();
  byOverall.forEach((m, idx) => overallRanks.set(m.economyId, idx + 1));

  // Combine metrics with rankings
  const rankings: EconomyRanking[] = allMetrics.map(metrics => ({
    ...metrics,
    rankByVideos: videoRanks.get(metrics.economyId) || 999,
    rankByMerchants: merchantRanks.get(metrics.economyId) || 999,
    rankByNewMerchants: newMerchantRanks.get(metrics.economyId) || 999,
    overallRank: overallRanks.get(metrics.economyId) || 999,
  }));

  // Sort by overall rank for return
  return rankings.sort((a, b) => a.overallRank - b.overallRank);
}

/**
 * Save rankings to the database
 */
export async function saveRankings(
  rankings: EconomyRanking[],
  period: RankingPeriod
): Promise<void> {
  const [year, month] = period.month.split('-').map(Number);

  // Delete existing rankings for this period
  await db
    .delete(monthlyRankings)
    .where(
      and(
        eq(monthlyRankings.month, period.month),
        eq(monthlyRankings.year, year)
      )
    );

  // Insert new rankings
  if (rankings.length > 0) {
    await db.insert(monthlyRankings).values(
      rankings.map(r => ({
        economyId: r.economyId,
        month: period.month,
        year,
        videosSubmitted: r.videosSubmitted,
        videosApproved: r.videosApproved,
        videosRejected: r.videosRejected,
        approvalRate: r.approvalRate.toString(),
        merchantsTotal: r.merchantsTotal,
        merchantsNew: r.merchantsNew,
        merchantsReturning: r.merchantsReturning,
        rankByVideos: r.rankByVideos,
        rankByMerchants: r.rankByMerchants,
        rankByNewMerchants: r.rankByNewMerchants,
        overallRank: r.overallRank,
        fundingEarned: 0, // Will be calculated in Phase 7
        calculatedAt: new Date(),
      }))
    );
  }
}

/**
 * Get saved rankings for a period
 */
export async function getSavedRankings(period: RankingPeriod): Promise<EconomyRanking[]> {
  const [year, month] = period.month.split('-').map(Number);

  const results = await db
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

  return results.map(({ ranking, economy }) => ({
    economyId: ranking.economyId,
    economyName: economy?.economyName || 'Unknown',
    videosSubmitted: ranking.videosSubmitted || 0,
    videosApproved: ranking.videosApproved || 0,
    videosRejected: ranking.videosRejected || 0,
    approvalRate: parseFloat(ranking.approvalRate || '0'),
    merchantsTotal: ranking.merchantsTotal || 0,
    merchantsNew: ranking.merchantsNew || 0,
    merchantsReturning: ranking.merchantsReturning || 0,
    videoScore: 0, // Not stored
    merchantScore: 0, // Not stored
    newMerchantScore: 0, // Not stored
    overallScore: 0, // Not stored
    rankByVideos: ranking.rankByVideos || 999,
    rankByMerchants: ranking.rankByMerchants || 999,
    rankByNewMerchants: ranking.rankByNewMerchants || 999,
    overallRank: ranking.overallRank || 999,
  }));
}

/**
 * Get all available ranking periods
 */
export async function getAvailablePeriods(): Promise<RankingPeriod[]> {
  const results = await db
    .selectDistinct({
      month: monthlyRankings.month,
      year: monthlyRankings.year,
    })
    .from(monthlyRankings)
    .orderBy(desc(monthlyRankings.year), desc(monthlyRankings.month));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return results.map(r => {
    const [, monthNum] = r.month.split('-').map(Number);
    return {
      month: r.month,
      year: r.year,
      monthName: monthNames[monthNum - 1],
    };
  });
}
