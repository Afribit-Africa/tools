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
    const { btcmapUrl, localName, notes } = body;

    // Validate required fields
    if (!btcmapUrl) {
      return NextResponse.json(
        { error: 'BTCMap URL is required' },
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

    // Verify merchant against BTCMap API
    let verifiedInfo = null;
    let verificationError = null;
    
    try {
      verifiedInfo = await verifyMerchant(btcmapUrl);
      if (!verifiedInfo) {
        verificationError = 'Merchant not found on BTCMap';
      }
    } catch (err) {
      console.error('BTCMap verification failed:', err);
      verificationError = 'Failed to verify with BTCMap';
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
        notes: notes || null,
        btcmapVerified: !!verifiedInfo,
        verificationError,
        lastVerifiedAt: verifiedInfo ? new Date() : null,
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
