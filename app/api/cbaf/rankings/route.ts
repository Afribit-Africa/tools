import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  calculateRankings,
  saveRankings,
  getSavedRankings,
  getCurrentPeriod,
  getPeriod,
  getAvailablePeriods,
} from '@/lib/cbaf/ranking-calculator';

/**
 * GET /api/cbaf/rankings
 * Retrieve rankings for a specific period or current month
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period'); // Format: "YYYY-MM"
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    let period;

    if (periodParam) {
      // Parse YYYY-MM format
      const [year, month] = periodParam.split('-').map(Number);
      period = getPeriod(year, month);
    } else if (yearParam && monthParam) {
      period = getPeriod(parseInt(yearParam), parseInt(monthParam));
    } else {
      // Default to current period
      period = getCurrentPeriod();
    }

    // Try to get saved rankings first
    const rankings = await getSavedRankings(period);

    return NextResponse.json({
      period,
      rankings,
      saved: rankings.length > 0,
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cbaf/rankings
 * Calculate and save rankings for a specific period (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { year, month } = body;

    let period;
    if (year && month) {
      period = getPeriod(parseInt(year), parseInt(month));
    } else {
      period = getCurrentPeriod();
    }

    // Calculate rankings
    const rankings = await calculateRankings(period);

    // Save to database
    await saveRankings(rankings, period);

    return NextResponse.json({
      success: true,
      period,
      rankings,
      message: `Rankings calculated and saved for ${period.monthName} ${period.year}`,
    });
  } catch (error) {
    console.error('Error calculating rankings:', error);
    return NextResponse.json(
      { error: 'Failed to calculate rankings' },
      { status: 500 }
    );
  }
}
