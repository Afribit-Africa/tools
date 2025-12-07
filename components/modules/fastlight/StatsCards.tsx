'use client';

import { formatNumber, formatPercentage } from '@/lib/utils';
import type { ValidationStats } from '@/types';

interface StatsCardsProps {
  stats: ValidationStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="card">
        <div className="text-text-secondary text-sm mb-1">Total</div>
        <div className="text-3xl font-mono font-bold">{formatNumber(stats.total)}</div>
      </div>

      <div className="card border-status-success/30">
        <div className="text-text-secondary text-sm mb-1">Valid</div>
        <div className="text-3xl font-mono font-bold text-status-success">
          {formatNumber(stats.valid)}
        </div>
        <div className="text-xs text-text-muted mt-1">
          {formatPercentage(stats.valid, stats.total)}
        </div>
      </div>

      <div className="card border-status-warning/30">
        <div className="text-text-secondary text-sm mb-1">Fixed</div>
        <div className="text-3xl font-mono font-bold text-status-warning">
          {formatNumber(stats.fixed)}
        </div>
        <div className="text-xs text-text-muted mt-1">
          {formatPercentage(stats.fixed, stats.total)}
        </div>
      </div>

      <div className="card border-status-error/30">
        <div className="text-text-secondary text-sm mb-1">Invalid</div>
        <div className="text-3xl font-mono font-bold text-status-error">
          {formatNumber(stats.invalid)}
        </div>
        <div className="text-xs text-text-muted mt-1">
          {formatPercentage(stats.invalid, stats.total)}
        </div>
      </div>

      <div className="card border-status-pending/30">
        <div className="text-text-secondary text-sm mb-1">Pending</div>
        <div className="text-3xl font-mono font-bold text-status-pending">
          {formatNumber(stats.pending)}
        </div>
        <div className="text-xs text-text-muted mt-1">
          {formatPercentage(stats.pending, stats.total)}
        </div>
      </div>
    </div>
  );
}
