'use client';

import { Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useNotification } from '@/components/ui/NotificationSystem';
import { useConfirmation } from '@/components/ui/ConfirmationModal';

interface CustomPeriodCalculatorProps {
  currentYear: number;
}

export default function CustomPeriodCalculator({ currentYear }: CustomPeriodCalculatorProps) {
  const router = useRouter();
  const { showInfo } = useNotification();
  const { confirm, ConfirmationDialog } = useConfirmation();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState('01');

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const selectedMonthName = months.find(m => m.value === selectedMonth)?.label;

  const handleCalculate = () => {
    confirm({
      title: 'Calculate Rankings',
      message: `Are you sure you want to calculate rankings for ${selectedMonthName} ${selectedYear}? This will process all approved videos for that period.`,
      type: 'info',
      confirmText: 'Calculate',
      onConfirm: () => {
        showInfo('Calculating Rankings', `Processing ${selectedMonthName} ${selectedYear}...`);
        router.push(`/cbaf/super-admin/funding?calculate=${selectedYear}-${selectedMonth}`);
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <CustomDropdown
          label="Year"
          options={years}
          value={selectedYear}
          onChange={setSelectedYear}
          placeholder="Select year"
        />

        <CustomDropdown
          label="Month"
          options={months}
          value={selectedMonth}
          onChange={setSelectedMonth}
          placeholder="Select month"
          searchable
        />
      </div>

      <div className="mt-4">
        <button
          onClick={handleCalculate}
          className="btn-primary w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Rankings
        </button>
      </div>

      {ConfirmationDialog}
    </>
  );
}
