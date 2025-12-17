'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  darkMode?: boolean;
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  darkMode = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  const bgClass = darkMode ? 'bg-black/95' : 'bg-white';
  const borderClass = darkMode ? 'border border-white/10' : 'border border-gray-200';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const iconClass = darkMode ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700';

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} ${bgClass} ${borderClass} rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200`}
      >
        {/* Header */}
        {title && (
          <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-heading font-bold ${textClass}`}>{title}</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
            >
              <X className={`w-5 h-5 ${iconClass}`} />
            </button>
          </div>
        )}

        {/* Close button (when no title) */}
        {!title && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${iconClass}`} />
          </button>
        )}

        {/* Content */}
        <div className={`p-6 ${!title ? 'pt-12' : ''}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
