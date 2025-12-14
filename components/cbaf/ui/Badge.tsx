import { HTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'bitcoin';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export default function Badge({
  variant = 'info',
  icon: Icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    bitcoin: 'badge-bitcoin',
  };

  return (
    <span className={`${variantClasses[variant]} ${className}`} {...props}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
