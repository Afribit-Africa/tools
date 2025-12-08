import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { verifyMerchant } from '@/lib/btcmap/verify-merchant';

/**
 * Verify a merchant against BTCMap API
 * Updates merchant record with verified information
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin();

    // Parse request body
    const body = await request.json();
    const { merchantId } = body;

    if (!merchantId) {
      return NextResponse.json(
        { error: 'Merchant ID is required' },
        { status: 400 }
      );
    }

    // Fetch merchant
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, merchantId),
    });

    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Verify against BTCMap
    const verifiedInfo = await verifyMerchant(merchant.btcmapUrl);

    if (!verifiedInfo) {
      // Verification failed
      await db
        .update(merchants)
        .set({
          btcmapVerified: false,
          verificationError: 'Merchant not found on BTCMap or invalid URL',
          lastVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(merchants.id, merchantId));

      return NextResponse.json(
        {
          success: false,
          error: 'Merchant not found on BTCMap',
          merchant: { id: merchantId, verified: false }
        },
        { status: 200 }
      );
    }

    // Update merchant with verified info
    const result = await db
      .update(merchants)
      .set({
        osmNodeId: verifiedInfo.osmNodeId,
        merchantName: verifiedInfo.name,
        category: verifiedInfo.category,
        latitude: verifiedInfo.latitude?.toString() || null,
        longitude: verifiedInfo.longitude?.toString() || null,
        address: verifiedInfo.address
          ? `${verifiedInfo.address}${verifiedInfo.city ? `, ${verifiedInfo.city}` : ''}${verifiedInfo.country ? `, ${verifiedInfo.country}` : ''}`
          : null,
        btcmapVerified: true,
        verificationError: null,
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, merchantId))
      .returning();

    const updatedMerchant = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({
      success: true,
      merchant: {
        id: updatedMerchant.id,
        name: updatedMerchant.merchantName,
        category: updatedMerchant.category,
        verified: updatedMerchant.btcmapVerified,
        osmNodeId: updatedMerchant.osmNodeId,
      },
      verifiedInfo,
    }, { status: 200 });

  } catch (error) {
    console.error('Merchant verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify all unverified merchants for an economy
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const economyId = searchParams.get('economyId');

    if (!economyId) {
      return NextResponse.json(
        { error: 'Economy ID is required' },
        { status: 400 }
      );
    }

    // Fetch unverified merchants
    const unverifiedMerchants = await db.query.merchants.findMany({
      where: eq(merchants.economyId, economyId),
      limit: 50,
    });

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Verify each merchant (with rate limiting)
    for (const merchant of unverifiedMerchants) {
      try {
        const verifiedInfo = await verifyMerchant(merchant.btcmapUrl);

        if (verifiedInfo) {
          // Update merchant
          await db
            .update(merchants)
            .set({
              osmNodeId: verifiedInfo.osmNodeId,
              merchantName: verifiedInfo.name,
              category: verifiedInfo.category,
              latitude: verifiedInfo.latitude?.toString() || null,
              longitude: verifiedInfo.longitude?.toString() || null,
              address: verifiedInfo.address
                ? `${verifiedInfo.address}${verifiedInfo.city ? `, ${verifiedInfo.city}` : ''}`
                : null,
              btcmapVerified: true,
              verificationError: null,
              lastVerifiedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(merchants.id, merchant.id));

          successCount++;
          results.push({
            id: merchant.id,
            name: verifiedInfo.name,
            verified: true,
          });
        } else {
          // Mark as failed
          await db
            .update(merchants)
            .set({
              btcmapVerified: false,
              verificationError: 'Not found on BTCMap',
              lastVerifiedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(merchants.id, merchant.id));

          failCount++;
          results.push({
            id: merchant.id,
            name: merchant.localName || 'Unknown',
            verified: false,
          });
        }

        // Rate limit: wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Failed to verify merchant ${merchant.id}:`, error);
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: unverifiedMerchants.length,
        verified: successCount,
        failed: failCount,
      },
      results,
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
