import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const economyId = searchParams.get('economyId');

    if (!economyId) {
      return NextResponse.json(
        { error: 'Economy ID is required' },
        { status: 400 }
      );
    }

    const economyMerchants = await db
      .select({
        id: merchants.id,
        btcmapUrl: merchants.btcmapUrl,
        merchantName: merchants.merchantName,
        localName: merchants.localName,
        lightningAddress: merchants.lightningAddress,
        paymentProvider: merchants.paymentProvider,
      })
      .from(merchants)
      .where(eq(merchants.economyId, economyId));

    return NextResponse.json({
      merchants: economyMerchants,
    });

  } catch (error) {
    console.error('Failed to fetch merchants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      { status: 500 }
    );
  }
}
