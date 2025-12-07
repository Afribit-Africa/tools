'use client';

import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/utils';
import { convertToCSV } from '@/lib/parsers';
import type { ValidationRecord } from '@/types';

interface ExportButtonProps {
  records: ValidationRecord[];
  fileName: string;
  disabled?: boolean;
}

export function ExportButton({ records, fileName, disabled }: ExportButtonProps) {
  const handleExportValid = () => {
    const validRecords = records.filter(r => r.status === 'valid' || r.status === 'fixed');
    const data = [
      ['Address'],
      ...validRecords.map(r => [r.cleaned || r.original]),
    ];
    const csv = convertToCSV(data);
    downloadFile(csv, `${fileName}_valid.csv`, 'text/csv');
  };

  const handleExportAll = () => {
    const data = [
      ['Original Address', 'Cleaned Address', 'Status', 'Issues', 'Error'],
      ...records.map(r => [
        r.original,
        r.cleaned || '',
        r.status,
        r.issues.join('; '),
        r.error || '',
      ]),
    ];
    const csv = convertToCSV(data);
    downloadFile(csv, `${fileName}_report.csv`, 'text/csv');
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExportValid}
        disabled={disabled || records.filter(r => r.status === 'valid' || r.status === 'fixed').length === 0}
        className="btn-primary flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Valid
      </button>

      <button
        onClick={handleExportAll}
        disabled={disabled || records.length === 0}
        className="btn-secondary flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Full Report
      </button>
    </div>
  );
}
