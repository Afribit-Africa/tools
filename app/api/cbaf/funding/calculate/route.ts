import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { getPeriod } from '@/lib/cbaf/ranking-calculator';
import { calculateFundingAllocation, DEFAULT_FUNDING_CONFIG } from '@/lib/cbaf/funding-calculator';

/**
 * POST /api/cbaf/funding/calculate
 * Calculate funding allocation for a period
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { period: periodStr, totalPool } = body;

    // Parse period
    const [year, month] = periodStr.split('-').map(Number);
    const period = getPeriod(year, month);

    // Configure funding pool
    const config = {
      ...DEFAULT_FUNDING_CONFIG,
      totalPool: totalPool || DEFAULT_FUNDING_CONFIG.totalPool,
    };

    // Calculate remaining pools after base allocation
    const estimatedEconomies = 20; // Rough estimate, will adjust in actual calculation
    const totalBase = config.baseAmount * estimatedEconomies;
    const remaining = config.totalPool - totalBase;
    config.rankBonusPool = Math.floor(remaining * 0.5);
    config.performanceBonusPool = remaining - config.rankBonusPool;

    // Calculate allocations
    const fundingPool = await calculateFundingAllocation(period, config);

    return NextResponse.json(fundingPool);
  } catch (error) {
    console.error('Error calculating funding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate funding' },
      { status: 500 }
    );
  }
}
