import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { getWalletBalance } from '@/lib/blink/payment-service';

/**
 * GET - Get current wallet balance
 */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const balance = await getWalletBalance();

    return NextResponse.json({
      success: true,
      balance,
      balanceBTC: balance / 100_000_000,
      balanceUSD: (balance / 100_000_000) * 35000, // Approx USD value
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch wallet balance',
      },
      { status: 500 }
    );
  }
}
