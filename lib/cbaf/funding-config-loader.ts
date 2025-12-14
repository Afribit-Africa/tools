/**
 * Funding Configuration Loader
 * Loads funding allocation settings from database
 */

import { db } from '@/lib/db';
import { superAdminSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface FundingConfig {
  baseAmount: number;
  rankBonusEnabled: boolean;
  rankBonusPool: number;
  performanceBonusEnabled: boolean;
  performanceBonusPool: number;
  totalPool?: number; // Optional override for total pool
}

const FUNDING_CONFIG_KEYS = {
  BASE_AMOUNT: 'funding_base_amount',
  RANK_BONUS_ENABLED: 'funding_rank_bonus_enabled',
  RANK_BONUS_POOL: 'funding_rank_bonus_pool',
  PERFORMANCE_BONUS_ENABLED: 'funding_performance_bonus_enabled',
  PERFORMANCE_BONUS_POOL: 'funding_performance_bonus_pool',
};

// Default configuration
const DEFAULT_CONFIG: FundingConfig = {
  baseAmount: 100000, // 100k sats
  rankBonusEnabled: true,
  rankBonusPool: 5000000, // 5M sats
  performanceBonusEnabled: true,
  performanceBonusPool: 4900000, // 4.9M sats
};

/**
 * Load funding configuration from database
 * Falls back to defaults if not configured
 */
export async function loadFundingConfig(): Promise<FundingConfig> {
  try {
    const settings = await db
      .select()
      .from(superAdminSettings)
      .where(eq(superAdminSettings.isActive, true));

    const config = { ...DEFAULT_CONFIG };

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

    return config;
  } catch (error) {
    console.error('Failed to load funding config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Calculate total pool from config
 */
export function calculateTotalPool(config: FundingConfig): number {
  let total = config.baseAmount;
  if (config.rankBonusEnabled) total += config.rankBonusPool;
  if (config.performanceBonusEnabled) total += config.performanceBonusPool;
  return total;
}
