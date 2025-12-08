'use client';

import { useState } from 'react';
import { Calculator, CheckCircle, AlertCircle } from 'lucide-react';

interface CalculateRankingsButtonProps {
  year: number;
  month: number;
  label: string;
  isCurrentMonth: boolean;
}

export default function CalculateRankingsButton({
  year,
  month,
  label,
  isCurrentMonth,
}: CalculateRankingsButtonProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleCalculate = async () => {
    if (
      !confirm(
        `Calculate rankings for ${label}?\n\nThis will:\n- Analyze all approved videos\n- Calculate metrics and rankings\n- ${
          isCurrentMonth ? 'Save' : 'Overwrite'
        } results in database`
      )
    ) {
      return;
    }

    setIsCalculating(true);
    setResult(null);

    try {
      const response = await fetch('/api/cbaf/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate rankings');
      }

      setResult({
        success: true,
        message: data.message || 'Rankings calculated successfully',
        count: data.rankings?.length || 0,
      });

      // Refresh the page after a delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Calculation failed',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isCalculating ? (
          <>
            <Calculator className="w-4 h-4 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4" />
            {label}
          </>
        )}
      </button>

      {result && (
        <div
          className={`p-3 rounded-lg border flex items-start gap-2 ${
            result.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                result.success ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {result.message}
            </p>
            {result.success && result.count !== undefined && (
              <p className="text-xs text-text-muted mt-1">
                Ranked {result.count} {result.count === 1 ? 'economy' : 'economies'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
