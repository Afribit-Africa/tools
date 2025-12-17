'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  darkMode?: boolean;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: {
    light: 'bg-green-50 border-green-200 text-green-900',
    dark: 'bg-green-500/10 border-green-500/30 text-green-400',
    icon: 'text-green-600',
    iconDark: 'text-green-400',
  },
  error: {
    light: 'bg-red-50 border-red-200 text-red-900',
    dark: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: 'text-red-600',
    iconDark: 'text-red-400',
  },
  warning: {
    light: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    dark: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    icon: 'text-yellow-600',
    iconDark: 'text-yellow-400',
  },
  info: {
    light: 'bg-blue-50 border-blue-200 text-blue-900',
    dark: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    icon: 'text-blue-600',
    iconDark: 'text-blue-400',
  },
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
  darkMode = true,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[type];
  const colorScheme = colors[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 200);
  };

  const bgClass = darkMode ? colorScheme.dark : colorScheme.light;
  const iconColor = darkMode ? colorScheme.iconDark : colorScheme.icon;

  return (
    <div
      className={`${bgClass} border rounded-xl p-4 shadow-lg backdrop-blur-xl min-w-[320px] max-w-md animate-in slide-in-from-right duration-200 ${
        isExiting ? 'animate-out slide-out-to-right' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm opacity-90">{message}</p>
          
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className={`mt-2 text-sm font-semibold ${darkMode ? 'hover:underline' : 'hover:underline'}`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastContainer({ toasts, position = 'top-right' }: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>,
    document.body
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
}
