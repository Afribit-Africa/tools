import { HTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'bitcoin';
  icon?: LucideIcon;
  children: React.ReactNode;
  darkMode?: boolean;
}

export default function Badge({
  variant = 'info',
  icon: Icon,
  children,
  darkMode = true,
  className = '',
  ...props
}: BadgeProps) {
  const lightVariantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    bitcoin: 'badge-bitcoin',
  };

  const darkVariantClasses = {
    success: 'badge-success-dark',
    warning: 'badge-warning-dark',
    error: 'badge-error-dark',
    info: 'badge-info-dark',
    bitcoin: 'badge-bitcoin-dark',
  };

  const variantClasses = darkMode ? darkVariantClasses : lightVariantClasses;

  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
