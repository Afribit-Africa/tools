import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { verifyBatchLightningAddresses, cleanLightningAddress } from '@/lib/services/flashlight';

/**
 * POST /api/cbaf/payments/verify
 * Verify Lightning addresses using Flashlight service
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const { addresses } = await request.json();

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'addresses array required' },
        { status: 400 }
      );
    }

    // Clean and deduplicate addresses
    const cleanedAddresses = Array.from(
      new Set(addresses.map(addr => cleanLightningAddress(addr)))
    );

    // Verify all addresses
    const resultsMap = await verifyBatchLightningAddresses(cleanedAddresses);

    // Convert Map to array
    const results = Array.from(resultsMap.values());

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.filter(r => !r.valid).length;

    return NextResponse.json({
      success: true,
      results,
      validCount,
      invalidCount,
      totalCount: results.length
    });

  } catch (error: any) {
    console.error('Address verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
