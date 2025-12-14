import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { parseBlinkAddress, extractUsername } from '@/lib/blink';

interface VerifyRequest {
  addresses: Array<{
    id: string;
    economyName: string;
    cleanedAddress: string;
  }>;
}

interface VerificationResult {
  id: string;
  economyName: string;
  address: string;
  status: 'valid' | 'invalid' | 'fixed';
  error?: string;
  walletId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: VerifyRequest = await request.json();
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const results: VerificationResult[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let fixedCount = 0;

    // Process each address
    for (const item of addresses) {
      const { id, economyName, cleanedAddress } = item;

      // Parse and validate Blink address format
      const parsed = parseBlinkAddress(cleanedAddress);

      if (!parsed.isValid) {
        results.push({
          id,
          economyName,
          address: cleanedAddress,
          status: 'invalid',
          error: parsed.error,
        });
        invalidCount++;
        continue;
      }

      // Extract username and verify with Blink API
      const username = extractUsername(cleanedAddress);
      if (!username) {
        results.push({
          id,
          economyName,
          address: cleanedAddress,
          status: 'invalid',
          error: 'Could not extract username',
        });
        invalidCount++;
        continue;
      }

      try {
        // Call Blink API to verify the address exists
        const response = await fetch('https://api.blink.sv/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query AccountDefaultWallet($username: Username!) {
                accountDefaultWallet(username: $username) {
                  id
                }
              }
            `,
            variables: { username },
          }),
        });

        const data = await response.json();

        if (data.errors || !data.data?.accountDefaultWallet) {
          results.push({
            id,
            economyName,
            address: cleanedAddress,
            status: 'invalid',
            error: data.errors?.[0]?.message || 'Account not found',
          });
          invalidCount++;
        } else {
          results.push({
            id,
            economyName,
            address: cleanedAddress,
            status: 'valid',
            walletId: data.data.accountDefaultWallet.id,
          });
          validCount++;
        }
      } catch (apiError) {
        results.push({
          id,
          economyName,
          address: cleanedAddress,
          status: 'invalid',
          error: 'API verification failed',
        });
        invalidCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      results,
      stats: {
        total: addresses.length,
        valid: validCount,
        invalid: invalidCount,
        fixed: fixedCount,
      },
    });
  } catch (error) {
    console.error('Error verifying addresses:', error);
    return NextResponse.json(
      { error: 'Failed to verify addresses' },
      { status: 500 }
    );
  }
}
