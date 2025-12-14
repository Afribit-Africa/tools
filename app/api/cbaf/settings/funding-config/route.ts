import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { superAdminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const FUNDING_CONFIG_KEYS = {
  BASE_AMOUNT: 'funding_base_amount',
  RANK_BONUS_ENABLED: 'funding_rank_bonus_enabled',
  RANK_BONUS_POOL: 'funding_rank_bonus_pool',
  PERFORMANCE_BONUS_ENABLED: 'funding_performance_bonus_enabled',
  PERFORMANCE_BONUS_POOL: 'funding_performance_bonus_pool',
};

export async function GET() {
  try {
    await requireSuperAdmin();

    // Get all funding config settings
    const settings = await db
      .select()
      .from(superAdminSettings)
      .where(eq(superAdminSettings.isActive, true));

    // Build config object with defaults
    const config = {
      baseAmount: 100000, // 100k sats default
      rankBonusEnabled: true,
      rankBonusPool: 5000000, // 5M sats default
      performanceBonusEnabled: true,
      performanceBonusPool: 4900000, // 4.9M sats default
    };

    // Override with stored settings
    settings.forEach(setting => {
      switch (setting.key) {
        case FUNDING_CONFIG_KEYS.BASE_AMOUNT:
          config.baseAmount = parseInt(setting.encryptedValue);
          break;
        case FUNDING_CONFIG_KEYS.RANK_BONUS_ENABLED:
          config.rankBonusEnabled = setting.encryptedValue === 'true';
          break;
        case FUNDING_CONFIG_KEYS.RANK_BONUS_POOL:
          config.rankBonusPool = parseInt(setting.encryptedValue);
          break;
        case FUNDING_CONFIG_KEYS.PERFORMANCE_BONUS_ENABLED:
          config.performanceBonusEnabled = setting.encryptedValue === 'true';
          break;
        case FUNDING_CONFIG_KEYS.PERFORMANCE_BONUS_POOL:
          config.performanceBonusPool = parseInt(setting.encryptedValue);
          break;
      }
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Get funding config error:', error);
    return NextResponse.json(
      { error: 'Failed to load funding configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const {
      baseAmount,
      rankBonusEnabled,
      rankBonusPool,
      performanceBonusEnabled,
      performanceBonusPool,
    } = body;

    // Validate inputs
    if (baseAmount !== undefined && (baseAmount < 0 || baseAmount > 1000000)) {
      return NextResponse.json(
        { error: 'Base amount must be between 0 and 1,000,000 sats' },
        { status: 400 }
      );
    }

    if (rankBonusPool !== undefined && (rankBonusPool < 0 || rankBonusPool > 100000000)) {
      return NextResponse.json(
        { error: 'Rank bonus pool must be between 0 and 100,000,000 sats' },
        { status: 400 }
      );
    }

    if (performanceBonusPool !== undefined && (performanceBonusPool < 0 || performanceBonusPool > 100000000)) {
      return NextResponse.json(
        { error: 'Performance bonus pool must be between 0 and 100,000,000 sats' },
        { status: 400 }
      );
    }

    // Update or insert settings
    const updates = [];

    if (baseAmount !== undefined) {
      updates.push(upsertSetting(FUNDING_CONFIG_KEYS.BASE_AMOUNT, baseAmount.toString(), 'Base amount per economy'));
    }

    if (rankBonusEnabled !== undefined) {
      updates.push(upsertSetting(FUNDING_CONFIG_KEYS.RANK_BONUS_ENABLED, rankBonusEnabled.toString(), 'Enable rank-based bonus'));
    }

    if (rankBonusPool !== undefined) {
      updates.push(upsertSetting(FUNDING_CONFIG_KEYS.RANK_BONUS_POOL, rankBonusPool.toString(), 'Rank bonus pool'));
    }

    if (performanceBonusEnabled !== undefined) {
      updates.push(upsertSetting(FUNDING_CONFIG_KEYS.PERFORMANCE_BONUS_ENABLED, performanceBonusEnabled.toString(), 'Enable performance bonus'));
    }

    if (performanceBonusPool !== undefined) {
      updates.push(upsertSetting(FUNDING_CONFIG_KEYS.PERFORMANCE_BONUS_POOL, performanceBonusPool.toString(), 'Performance bonus pool'));
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Funding configuration updated' });
  } catch (error) {
    console.error('Update funding config error:', error);
    return NextResponse.json(
      { error: 'Failed to update funding configuration' },
      { status: 500 }
    );
  }
}

async function upsertSetting(key: string, value: string, description: string) {
  const existing = await db
    .select()
    .from(superAdminSettings)
    .where(eq(superAdminSettings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(superAdminSettings)
      .set({
        encryptedValue: value,
        updatedAt: new Date(),
      })
      .where(eq(superAdminSettings.key, key));
  } else {
    await db.insert(superAdminSettings).values({
      key,
      encryptedValue: value,
      description,
      isActive: true,
    });
  }
}
