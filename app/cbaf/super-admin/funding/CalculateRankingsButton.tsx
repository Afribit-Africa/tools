'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useConfirmation } from '@/components/ui/ConfirmationModal';
import { useNotification } from '@/components/ui/NotificationSystem';

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
  const { confirm, ConfirmationDialog } = useConfirmation();
  const { showSuccess, showError, showInfo } = useNotification();

  const performCalculation = async () => {
    setIsCalculating(true);

    showInfo(
      'Calculating Rankings',
      `Processing ${label}... This may take a few moments.`
    );

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

      const count = data.rankings?.length || 0;

      showSuccess(
        'Rankings Calculated Successfully',
        `Ranked ${count} ${count === 1 ? 'economy' : 'economies'} for ${label}`
      );

      // Refresh the page after a delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed';

      showError(
        'Ranking Calculation Failed',
        errorMessage
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculate = () => {
    confirm({
      title: `Calculate Rankings for ${label}?`,
      message: `This will:\n• Analyze all approved videos\n• Calculate metrics and rankings\n• ${
        isCurrentMonth ? 'Save' : 'Overwrite'
      } results in database\n\nThis operation may take a few moments.`,
      confirmText: 'Calculate Rankings',
      type: 'warning',
      onConfirm: performCalculation,
    });
  };

  return (
    <>
      {ConfirmationDialog}
      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  );
}
