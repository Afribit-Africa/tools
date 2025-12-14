import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { getPeriod } from '@/lib/cbaf/ranking-calculator';
import { calculateFundingAllocation } from '@/lib/cbaf/funding-calculator';
import { loadFundingConfig } from '@/lib/cbaf/funding-config-loader';

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

    // Load funding configuration from database
    const fundingConfig = await loadFundingConfig();

    // Use custom total pool if provided
    if (totalPool) {
      fundingConfig.totalPool = totalPool;
    }

    // Calculate allocations
    const fundingPool = await calculateFundingAllocation(period, fundingConfig);

    return NextResponse.json(fundingPool);
  } catch (error) {
    console.error('Error calculating funding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate funding' },
      { status: 500 }
    );
  }
}
