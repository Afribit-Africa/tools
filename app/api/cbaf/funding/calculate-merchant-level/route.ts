import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { calculateFundingAllocation } from '@/lib/cbaf/funding-calculator';
import { calculateMerchantFunding } from '@/lib/cbaf/merchant-funding-calculator';
import { loadFundingConfig } from '@/lib/cbaf/funding-config-loader';

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const { period, totalPool } = await req.json();

    if (!period) {
      return NextResponse.json(
        { error: 'Period is required' },
        { status: 400 }
      );
    }

    // Parse period
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const rankingPeriod = {
      month: period,
      year,
      monthName: monthNames[month - 1]
    };

    // Load funding configuration from database
    const fundingConfig = await loadFundingConfig();

    // Use custom total pool if provided, otherwise calculate from config
    const poolToUse = totalPool || (
      fundingConfig.baseAmount +
      (fundingConfig.rankBonusEnabled ? fundingConfig.rankBonusPool : 0) +
      (fundingConfig.performanceBonusEnabled ? fundingConfig.performanceBonusPool : 0)
    );

    // Step 1: Calculate economy-level allocations (from rankings)
    const fundingPool = await calculateFundingAllocation(rankingPeriod, {
      ...fundingConfig,
      totalPool: poolToUse,
    });

    // Step 2: Calculate merchant-level distribution
    const economyAllocations = fundingPool.allocations.map(alloc => ({
      economyId: alloc.economyId,
      economyName: alloc.economyName,
      totalFunding: alloc.totalFunding,
      overallRank: alloc.overallRank,
    }));

    const merchantFunding = await calculateMerchantFunding(rankingPeriod, economyAllocations);

    return NextResponse.json({
      success: true,
      period: rankingPeriod,
      economyLevelAllocation: {
        totalPool: fundingPool.totalPool,
        economies: fundingPool.allocations.length,
      },
      merchantLevelDistribution: {
        totalPool: merchantFunding.totalPool,
        totalDistributed: merchantFunding.totalDistributed,
        totalUnallocated: merchantFunding.totalUnallocated,
        unallocatedPercentage: ((merchantFunding.totalUnallocated / merchantFunding.totalPool) * 100).toFixed(1),
        economyBreakdowns: merchantFunding.economyBreakdowns,
        paymentRecords: merchantFunding.paymentRecords,
        summary: merchantFunding.summary,
      },
    });
  } catch (error) {
    console.error('Merchant funding calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate merchant funding' },
      { status: 500 }
    );
  }
}
