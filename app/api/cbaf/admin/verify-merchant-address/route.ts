import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validatePaymentAddress } from '@/lib/payment';
import type { PaymentProvider } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const { merchantId, address, provider } = await req.json();

    if (!merchantId || !address || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate the address
    const validation = await validatePaymentAddress(
      address,
      provider as PaymentProvider
    );

    // Update merchant record
    await db
      .update(merchants)
      .set({
        addressVerified: validation.valid,
        addressVerificationError: validation.error || null,
        addressVerifiedAt: validation.valid ? new Date() : null,
        addressVerifiedBy: validation.valid ? session.user.id : null,
        lightningAddress: validation.address || address,
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, merchantId));

    return NextResponse.json({
      success: true,
      valid: validation.valid,
      error: validation.error,
      sanitizedAddress: validation.address,
    });
  } catch (error) {
    console.error('Address verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify address' },
      { status: 500 }
    );
  }
}
