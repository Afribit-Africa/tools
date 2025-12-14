import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { superAdminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/crypto/encryption';

const BLINK_API_KEY_SETTING = 'blink_api_key';

/**
 * GET - Retrieve Blink wallet settings
 */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const setting = await db.query.superAdminSettings.findFirst({
      where: eq(superAdminSettings.key, BLINK_API_KEY_SETTING),
    });

    if (!setting) {
      return NextResponse.json({
        apiKey: null,
        isConnected: false,
        lastTested: null,
        walletBalance: null,
      });
    }

    // Parse metadata if exists
    let metadata: { balance?: number } = {};
    if (setting.metadata) {
      try {
        metadata = JSON.parse(setting.metadata);
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }

    return NextResponse.json({
      apiKey: '••••••••••••••••••••••••••••••••', // Masked
      isConnected: setting.isConnected,
      lastTested: setting.lastTested,
      walletBalance: metadata.balance || null,
    });
  } catch (error) {
    console.error('Error fetching Blink settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save Blink API key
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Don't save if it's the masked value
    if (apiKey.startsWith('••')) {
      return NextResponse.json(
        { error: 'Cannot save masked API key' },
        { status: 400 }
      );
    }

    // Encrypt the API key
    const encryptedValue = encrypt(apiKey.trim());

    // Check if setting exists
    const existingSetting = await db.query.superAdminSettings.findFirst({
      where: eq(superAdminSettings.key, BLINK_API_KEY_SETTING),
    });

    if (existingSetting) {
      // Update existing
      await db
        .update(superAdminSettings)
        .set({
          encryptedValue,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(superAdminSettings.key, BLINK_API_KEY_SETTING));
    } else {
      // Create new
      await db.insert(superAdminSettings).values({
        key: BLINK_API_KEY_SETTING,
        encryptedValue,
        description: 'Blink wallet API key for automated payments',
        isActive: true,
        isConnected: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully',
    });
  } catch (error) {
    console.error('Error saving Blink settings:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove Blink API key
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireSuperAdmin();

    await db
      .delete(superAdminSettings)
      .where(eq(superAdminSettings.key, BLINK_API_KEY_SETTING));

    return NextResponse.json({
      success: true,
      message: 'API key removed successfully',
    });
  } catch (error) {
    console.error('Error removing Blink settings:', error);
    return NextResponse.json(
      { error: 'Failed to remove API key' },
      { status: 500 }
    );
  }
}
