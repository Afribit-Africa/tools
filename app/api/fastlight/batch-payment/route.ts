import { NextRequest, NextResponse } from 'next/server';
import { BlinkPaymentClient } from '@/lib/blink/payment-client';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, walletId, payments } = await request.json();

    if (!apiKey || !walletId || !payments) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const client = new BlinkPaymentClient(apiKey);
    const results = [];

    // Process payments sequentially to avoid overwhelming the API
    for (const payment of payments) {
      const result = await client.sendToLightningAddress(
        walletId,
        payment.address,
        payment.amount
      );
      results.push(result);

      // Small delay between payments
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Batch payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Batch payment failed',
      },
      { status: 500 }
    );
  }
}
