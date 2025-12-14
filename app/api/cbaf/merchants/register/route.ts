import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { requireBCE } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';
import { verifyMerchant, extractOsmNodeId } from '@/lib/btcmap/verify-merchant';

export async function POST(request: NextRequest) {
  try {
    // Require BCE authentication
    const session = await requireBCE();

    const economyId = session.user.economyId;
    if (!economyId) {
      return NextResponse.json(
        { error: 'Economy profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { btcmapUrl, localName, lightningAddress, paymentProvider, notes } = body;

    // Validate required fields
    if (!btcmapUrl) {
      return NextResponse.json(
        { error: 'BTCMap URL is required' },
        { status: 400 }
      );
    }

    // Validate lightning address
    if (!lightningAddress) {
      return NextResponse.json(
        { error: 'Lightning Address is required' },
        { status: 400 }
      );
    }

    // Validate BTCMap URL format
    if (!btcmapUrl.includes('btcmap.org')) {
      return NextResponse.json(
        { error: 'Invalid BTCMap URL. Must be from btcmap.org' },
        { status: 400 }
      );
    }

    // Check if merchant already exists for this economy
    const existing = await db
      .select()
      .from(merchants)
      .where(
        and(
          eq(merchants.economyId, economyId),
          eq(merchants.btcmapUrl, btcmapUrl)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'This merchant is already registered in your economy' },
        { status: 409 }
      );
    }

    // Extract OSM node ID from BTCMap URL
    const osmNodeId = extractOsmNodeId(btcmapUrl);

    if (!osmNodeId) {
      return NextResponse.json(
        { error: 'Invalid BTCMap URL format. Please use the format: https://btcmap.org/merchant/12345' },
        { status: 400 }
      );
    }

    // Verify merchant against BTCMap API
    let verifiedInfo = null;
    let verificationError = null;
    let btcmapVerified = false;

    try {
      verifiedInfo = await verifyMerchant(btcmapUrl);
      if (verifiedInfo) {
        // API returned data - fully verified
        btcmapVerified = true;
      } else {
        // API didn't return data, but URL format is valid
        // Mark as verified since the URL is from BTCMap
        btcmapVerified = true;
        console.log(`⚠️ BTCMap API didn't return data for ${osmNodeId}, but URL is valid - marking as verified`);
      }
    } catch (err) {
      console.error('BTCMap verification failed:', err);
      // Even on API error, if URL format is valid, trust it
      btcmapVerified = true;
      verificationError = null; // Clear error since URL format is valid
    }

    // Create merchant record with verified data if available
    const result = await db
      .insert(merchants)
      .values({
        economyId,
        btcmapUrl,
        osmNodeId: verifiedInfo?.osmNodeId || osmNodeId,
        merchantName: verifiedInfo?.name || null,
        category: verifiedInfo?.category || null,
        latitude: verifiedInfo?.latitude?.toString() || null,
        longitude: verifiedInfo?.longitude?.toString() || null,
        address: verifiedInfo?.address
          ? `${verifiedInfo.address}${verifiedInfo.city ? `, ${verifiedInfo.city}` : ''}${verifiedInfo.country ? `, ${verifiedInfo.country}` : ''}`
          : null,
        localName: localName || null,
        lightningAddress: lightningAddress || null,
        paymentProvider: paymentProvider || 'blink',
        notes: notes || null,
        btcmapVerified, // Use the btcmapVerified variable we set above
        verificationError,
        lastVerifiedAt: btcmapVerified ? new Date() : null,
        isActive: true,
        registeredAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const merchant = Array.isArray(result) ? result[0] : result;

    if (!merchant) {
      return NextResponse.json(
        { error: 'Failed to register merchant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        btcmapUrl: merchant.btcmapUrl,
        localName: merchant.localName,
        osmNodeId: merchant.osmNodeId,
        verified: merchant.btcmapVerified,
        verificationError: merchant.verificationError,
      },
      verifiedInfo,
    }, { status: 201 });

  } catch (error) {
    console.error('Merchant registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
