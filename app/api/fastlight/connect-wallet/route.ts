import { NextRequest, NextResponse } from 'next/server';
import { BlinkPaymentClient } from '@/lib/blink/payment-client';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const client = new BlinkPaymentClient(apiKey);
    const account = await client.getAccount();

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      },
      { status: 500 }
    );
  }
}
