import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { superAdminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto/encryption';

const BLINK_API_KEY_SETTING = 'blink_api_key';
const BLINK_API_URL = 'https://api.blink.sv/graphql';

/**
 * POST - Test Blink wallet connection
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    // Retrieve encrypted API key
    const setting = await db.query.superAdminSettings.findFirst({
      where: eq(superAdminSettings.key, BLINK_API_KEY_SETTING),
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'No API key configured. Please save your API key first.' },
        { status: 400 }
      );
    }

    // Decrypt API key
    let apiKey: string;
    try {
      apiKey = decrypt(setting.encryptedValue);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to decrypt API key. Please re-enter your key.' },
        { status: 500 }
      );
    }

    // Test connection with Blink API
    // Using a simple query to get account balance
    const query = `
      query Me {
        me {
          id
          defaultAccount {
            id
            wallets {
              id
              walletCurrency
              balance
            }
          }
        }
      }
    `;

    const response = await fetch(BLINK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blink API error:', errorText);

      // Update connection status
      await db
        .update(superAdminSettings)
        .set({
          isConnected: false,
          lastTested: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(superAdminSettings.key, BLINK_API_KEY_SETTING));

      return NextResponse.json(
        { error: 'Invalid API key or connection failed' },
        { status: 401 }
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);

      // Update connection status
      await db
        .update(superAdminSettings)
        .set({
          isConnected: false,
          lastTested: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(superAdminSettings.key, BLINK_API_KEY_SETTING));

      return NextResponse.json(
        { error: data.errors[0]?.message || 'API request failed' },
        { status: 400 }
      );
    }

    // Extract balance (assuming BTC wallet)
    const btcWallet = data.data?.me?.defaultAccount?.wallets?.find(
      (w: any) => w.walletCurrency === 'BTC'
    );
    const balance = btcWallet?.balance || 0;

    // Update connection status and metadata
    await db
      .update(superAdminSettings)
      .set({
        isConnected: true,
        lastTested: new Date(),
        metadata: JSON.stringify({ balance }),
        updatedAt: new Date(),
      })
      .where(eq(superAdminSettings.key, BLINK_API_KEY_SETTING));

    return NextResponse.json({
      success: true,
      balance,
      message: 'Connection successful',
    });
  } catch (error) {
    console.error('Error testing Blink connection:', error);
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}
