'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorAlert({ title, message, onClose, type = 'error' }: ErrorAlertProps) {
  const styles = {
    error: {
      bg: 'bg-status-error/10',
      border: 'border-status-error/30',
      text: 'text-status-error',
    },
    warning: {
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
      text: 'text-status-warning',
    },
    info: {
      bg: 'bg-bitcoin/10',
      border: 'border-bitcoin/30',
      text: 'text-bitcoin',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${style.text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
