import { NextResponse } from 'next/server';
import { getAvailablePeriods } from '@/lib/cbaf/ranking-calculator';

/**
 * GET /api/cbaf/rankings/periods
 * Get all available ranking periods
 */
export async function GET() {
  try {
    const periods = await getAvailablePeriods();

    return NextResponse.json({
      periods,
    });
  } catch (error) {
    console.error('Error fetching available periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch periods' },
      { status: 500 }
    );
  }
}
