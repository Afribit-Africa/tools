import { NextRequest, NextResponse } from 'next/server';
import { validatePaymentAddress } from '@/lib/payment';
import type { PaymentProvider } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    const { address, provider } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!provider || typeof provider !== 'string') {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const result = await validatePaymentAddress(
      address.trim(),
      provider as PaymentProvider
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Address validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate address' },
      { status: 500 }
    );
  }
}
