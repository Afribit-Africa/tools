import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { requireBCE } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

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

    // Extract OSM node ID from BTCMap URL if possible
    // BTCMap URLs are typically: https://btcmap.org/merchant/<osm_node_id>
    let osmNodeId: string | null = null;
    try {
      const urlParts = btcmapUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && !isNaN(parseInt(lastPart))) {
        osmNodeId = lastPart;
      }
    } catch (err) {
      console.error('Failed to extract OSM node ID:', err);
    }

    // Create merchant record
    const result = await db
      .insert(merchants)
      .values({
        economyId,
        btcmapUrl,
        osmNodeId,
        localName: localName || null,
        notes: notes || null,
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

    // TODO: Phase 5 - Trigger BTCMap verification in background
    // This would fetch merchant details from BTCMap API and update the record

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        btcmapUrl: merchant.btcmapUrl,
        localName: merchant.localName,
        osmNodeId: merchant.osmNodeId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Merchant registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
