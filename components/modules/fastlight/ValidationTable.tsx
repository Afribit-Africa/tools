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
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'invalid':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'fixed':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ValidationRecord['status']) => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Valid</span>;
      case 'invalid':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Invalid</span>;
      case 'fixed':
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Fixed</span>;
      case 'pending':
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">Pending</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Original Address</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cleaned Address</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Issues</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {records.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-gray-500">
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
              <tr key={record.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{String(index + 1).padStart(3, '0')}</td>
                <td className="px-4 py-3 font-mono text-sm text-white">
                  {record.original || <span className="text-gray-600">-</span>}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-white">
                  {record.cleaned || <span className="text-gray-600">-</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    {getStatusBadge(record.status)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {record.issues.length > 0 ? (
                    <span className="text-gray-400">{record.issues.join(', ')}</span>
                  ) : record.error ? (
                    <span className="text-red-400">{record.error}</span>
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
