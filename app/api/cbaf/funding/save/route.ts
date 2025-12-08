import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { getPeriod } from '@/lib/cbaf/ranking-calculator';
import { saveFundingDisbursements } from '@/lib/cbaf/funding-calculator';

/**
 * POST /api/cbaf/funding/save
 * Save funding disbursements to database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSuperAdmin();

    const body = await request.json();
    const { period: periodStr, fundingData } = body;

    // Parse period
    const [year, month] = periodStr.split('-').map(Number);
    const period = getPeriod(year, month);

    // Save to database
    await saveFundingDisbursements(
      fundingData,
      period,
      session.user.email || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Saved ${fundingData.allocations.length} disbursements for ${period.monthName} ${period.year}`,
    });
  } catch (error) {
    console.error('Error saving funding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save funding' },
      { status: 500 }
    );
  }
}
