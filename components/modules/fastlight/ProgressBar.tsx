'use client';

import { formatPercentage } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  currentAction?: string;
}

export function ProgressBar({ current, total, currentAction }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-bitcoin animate-spin" />
          <span className="text-text-secondary">
            {currentAction || 'Processing...'}
          </span>
        </div>
        <span className="font-mono font-bold text-bitcoin">
          {formatPercentage(current, total)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
        <span>Progress: {current} / {total} addresses</span>
        <span>{total - current} remaining</span>
      </div>
      <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-bitcoin to-bitcoin-light transition-all duration-300 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
