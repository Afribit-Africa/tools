'use client';

import { formatNumber, formatPercentage } from '@/lib/utils';
import type { ValidationStats } from '@/types';

interface StatsCardsProps {
  stats: ValidationStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="text-gray-400 text-sm mb-1">Total</div>
        <div className="text-3xl font-mono font-bold text-white">{formatNumber(stats.total)}</div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
        <div className="text-gray-400 text-sm mb-1">Valid</div>
        <div className="text-3xl font-mono font-bold text-green-400">
          {formatNumber(stats.valid)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatPercentage(stats.valid, stats.total)}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4">
        <div className="text-gray-400 text-sm mb-1">Fixed</div>
        <div className="text-3xl font-mono font-bold text-yellow-400">
          {formatNumber(stats.fixed)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatPercentage(stats.fixed, stats.total)}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-xl p-4">
        <div className="text-gray-400 text-sm mb-1">Invalid</div>
        <div className="text-3xl font-mono font-bold text-red-400">
          {formatNumber(stats.invalid)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatPercentage(stats.invalid, stats.total)}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-gray-500/30 rounded-xl p-4">
        <div className="text-gray-400 text-sm mb-1">Pending</div>
        <div className="text-3xl font-mono font-bold text-gray-400">
          {formatNumber(stats.pending)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatPercentage(stats.pending, stats.total)}
        </div>
      </div>
    </div>
  );
}
