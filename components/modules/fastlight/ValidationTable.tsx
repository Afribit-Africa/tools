'use client';

import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ValidationRecord } from '@/types';

interface ValidationTableProps {
  records: ValidationRecord[];
  isValidating: boolean;
}

export function ValidationTable({ records, isValidating }: ValidationTableProps) {
  const getStatusIcon = (status: ValidationRecord['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-5 h-5 text-status-success" />;
      case 'invalid':
        return <XCircle className="w-5 h-5 text-status-error" />;
      case 'fixed':
        return <AlertCircle className="w-5 h-5 text-status-warning" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-status-pending animate-spin" />;
    }
  };

  const getStatusBadge = (status: ValidationRecord['status']) => {
    switch (status) {
      case 'valid':
        return <span className="badge-success">✓ Valid</span>;
      case 'invalid':
        return <span className="badge-error">✗ Invalid</span>;
      case 'fixed':
        return <span className="badge-warning">⚠ Fixed</span>;
      case 'pending':
        return <span className="badge-pending">⏳ Pending</span>;
    }
  };

  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="w-16">#</th>
              <th>Original Address</th>
              <th>Cleaned Address</th>
              <th>Status</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-muted">
                  {isValidating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validating addresses...</span>
                    </div>
                  ) : (
                    'No addresses to display'
                  )}
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={record.id}>
                  <td className="text-text-muted">{String(index + 1).padStart(3, '0')}</td>
                  <td className="font-mono text-sm">
                    {record.original || <span className="text-text-muted">-</span>}
                  </td>
                  <td className="font-mono text-sm">
                    {record.cleaned || <span className="text-text-muted">-</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      {getStatusBadge(record.status)}
                    </div>
                  </td>
                  <td className="text-sm">
                    {record.issues.length > 0 ? (
                      <span className="text-text-secondary">{record.issues.join(', ')}</span>
                    ) : record.error ? (
                      <span className="text-status-error">{record.error}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
