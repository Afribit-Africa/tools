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
          <Loader2 className="w-4 h-4 text-bitcoin-400 animate-spin" />
          <span className="text-gray-400">
            {currentAction || 'Processing...'}
          </span>
        </div>
        <span className="font-mono font-bold text-bitcoin-400">
          {formatPercentage(current, total)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Progress: {current} / {total} addresses</span>
        <span>{total - current} remaining</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-bitcoin-500 to-orange-500 transition-all duration-300 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
