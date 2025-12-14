/**
 * CBAF Merchant Funding Calculator
 *
 * Calculates and distributes funding at merchant level based on verified addresses
 * Replaces economy-level distribution with merchant-level verified addresses
 */

import { db } from '@/lib/db';
import { monthlyRankings, economies, merchants, videoMerchants, videoSubmissions, fundingDisbursements } from '@/lib/db/schema';
import { eq, and, inArray, isNotNull } from 'drizzle-orm';
import type { RankingPeriod } from './ranking-calculator';

export interface MerchantPayment {
  merchantId: string;
  merchantName: string;
  localName: string | null;
  lightningAddress: string;
  paymentProvider: string;
  economyId: string;
  economyName: string;
  amountSats: number;
  videoAppearances: number;
  addressVerified: boolean;
  addressVerifiedAt: Date | null;
}

export interface EconomyFundingBreakdown {
  economyId: string;
  economyName: string;
  overallRank: number;
  totalAllocation: number;
  verifiedMerchants: number;
  unverifiedMerchants: number;
  merchantsWithoutAddresses: number;
  merchantPayments: MerchantPayment[];
  unallocatedAmount: number; // Amount that can't be distributed due to missing/unverified addresses
}

export interface MerchantFundingPool {
  period: RankingPeriod;
  totalPool: number;
  totalDistributed: number;
  totalUnallocated: number;
  economyBreakdowns: EconomyFundingBreakdown[];
  paymentRecords: MerchantPayment[];
  summary: {
    totalMerchants: number;
    merchantsWithVerifiedAddresses: number;
    merchantsWithUnverifiedAddresses: number;
    merchantsWithoutAddresses: number;
  };
}

/**
 * Calculate merchant-level funding distribution
 *
 * Process:
 * 1. Get economy-level allocations from rankings
 * 2. For each economy, find all merchants with verified addresses
 * 3. Distribute economy's allocation equally among verified merchants
 * 4. Track unallocated funds (merchants without addresses or unverified)
 */
export async function calculateMerchantFunding(
  period: RankingPeriod,
  economyAllocations: Array<{ economyId: string; economyName: string; totalFunding: number; overallRank: number }>
): Promise<MerchantFundingPool> {
  const economyBreakdowns: EconomyFundingBreakdown[] = [];
  const allPaymentRecords: MerchantPayment[] = [];

  let totalDistributed = 0;
  let totalUnallocated = 0;

  // Get period dates for video filtering
  const [year, month] = period.month.split('-').map(Number);

  for (const allocation of economyAllocations) {
    // Get all merchants for this economy that appeared in approved videos this period
    const economyMerchantsRaw = await db
      .select({
        merchantId: merchants.id,
        merchantName: merchants.merchantName,
        localName: merchants.localName,
        lightningAddress: merchants.lightningAddress,
        paymentProvider: merchants.paymentProvider,
        addressVerified: merchants.addressVerified,
        addressVerifiedAt: merchants.addressVerifiedAt,
      })
      .from(merchants)
      .leftJoin(videoMerchants, eq(merchants.id, videoMerchants.merchantId))
      .leftJoin(videoSubmissions, and(
        eq(videoMerchants.videoId, videoSubmissions.id),
        eq(videoSubmissions.status, 'approved'),
        eq(videoSubmissions.submissionMonth, period.month)
      ))
      .where(and(
        eq(merchants.economyId, allocation.economyId),
        isNotNull(videoSubmissions.id) // Only merchants that appeared in videos
      ))
      .groupBy(
        merchants.id,
        merchants.merchantName,
        merchants.localName,
        merchants.lightningAddress,
        merchants.paymentProvider,
        merchants.addressVerified,
        merchants.addressVerifiedAt
      );

    // Count video appearances per merchant
    const merchantAppearances = new Map<string, number>();
    for (const merchant of economyMerchantsRaw) {
      const count = await db
        .select()
        .from(videoMerchants)
        .leftJoin(videoSubmissions, eq(videoMerchants.videoId, videoSubmissions.id))
        .where(and(
          eq(videoMerchants.merchantId, merchant.merchantId),
          eq(videoSubmissions.status, 'approved'),
          eq(videoSubmissions.submissionMonth, period.month)
        ));
      merchantAppearances.set(merchant.merchantId, count.length);
    }

    // Categorize merchants
    const verifiedMerchants = economyMerchantsRaw.filter(m =>
      m.lightningAddress && m.addressVerified
    );
    const unverifiedMerchants = economyMerchantsRaw.filter(m =>
      m.lightningAddress && !m.addressVerified
    );
    const merchantsWithoutAddresses = economyMerchantsRaw.filter(m =>
      !m.lightningAddress
    );

    // Calculate per-merchant allocation
    const merchantPayments: MerchantPayment[] = [];
    let distributedAmount = 0;

    if (verifiedMerchants.length > 0) {
      const amountPerMerchant = Math.floor(allocation.totalFunding / verifiedMerchants.length);

      for (const merchant of verifiedMerchants) {
        const payment: MerchantPayment = {
          merchantId: merchant.merchantId,
          merchantName: merchant.merchantName || 'Unknown Merchant',
          localName: merchant.localName,
          lightningAddress: merchant.lightningAddress!,
          paymentProvider: merchant.paymentProvider || 'unknown',
          economyId: allocation.economyId,
          economyName: allocation.economyName,
          amountSats: amountPerMerchant,
          videoAppearances: merchantAppearances.get(merchant.merchantId) || 0,
          addressVerified: true,
          addressVerifiedAt: merchant.addressVerifiedAt,
        };

        merchantPayments.push(payment);
        allPaymentRecords.push(payment);
        distributedAmount += amountPerMerchant;
      }
    }

    const unallocatedAmount = allocation.totalFunding - distributedAmount;

    economyBreakdowns.push({
      economyId: allocation.economyId,
      economyName: allocation.economyName,
      overallRank: allocation.overallRank,
      totalAllocation: allocation.totalFunding,
      verifiedMerchants: verifiedMerchants.length,
      unverifiedMerchants: unverifiedMerchants.length,
      merchantsWithoutAddresses: merchantsWithoutAddresses.length,
      merchantPayments,
      unallocatedAmount,
    });

    totalDistributed += distributedAmount;
    totalUnallocated += unallocatedAmount;
  }

  const totalPool = economyAllocations.reduce((sum, a) => sum + a.totalFunding, 0);

  return {
    period,
    totalPool,
    totalDistributed,
    totalUnallocated,
    economyBreakdowns,
    paymentRecords: allPaymentRecords,
    summary: {
      totalMerchants: allPaymentRecords.length +
        economyBreakdowns.reduce((sum, e) => sum + e.unverifiedMerchants + e.merchantsWithoutAddresses, 0),
      merchantsWithVerifiedAddresses: allPaymentRecords.length,
      merchantsWithUnverifiedAddresses: economyBreakdowns.reduce((sum, e) => sum + e.unverifiedMerchants, 0),
      merchantsWithoutAddresses: economyBreakdowns.reduce((sum, e) => sum + e.merchantsWithoutAddresses, 0),
    },
  };
}

/**
 * Export merchant payments to CSV format
 */
export function exportMerchantPaymentsCSV(funding: MerchantFundingPool): string {
  const headers = [
    'Lightning Address',
    'Amount (sats)',
    'Merchant Name',
    'Local Name',
    'Provider',
    'Economy',
    'Economy Rank',
    'Video Appearances',
    'Note'
  ];

  const rows = funding.paymentRecords.map(payment => {
    const economy = funding.economyBreakdowns.find(e => e.economyId === payment.economyId);
    return [
      payment.lightningAddress,
      payment.amountSats.toString(),
      payment.merchantName,
      payment.localName || '',
      payment.paymentProvider,
      payment.economyName,
      economy?.overallRank.toString() || '',
      payment.videoAppearances.toString(),
      `CBAF ${funding.period.monthName} ${funding.period.year} - Merchant Payment`
    ];
  });

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}
