import { NextRequest, NextResponse } from 'next/server';
import { verifyBlinkAddress } from '@/lib/blink';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    const result = await verifyBlinkAddress(username);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
