import { HTMLAttributes, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, LucideIcon } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
}

const defaultIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantClasses = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

const titleColors = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
};

const textColors = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700',
};

export default function Alert({
  variant = 'info',
  title,
  children,
  icon,
  className = '',
  ...props
}: AlertProps) {
  const Icon = icon || defaultIcons[variant];

  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      <Icon className={`w-5 h-5 ${iconColors[variant]} flex-shrink-0 mt-0.5`} />
      <div className={`text-sm ${textColors[variant]}`}>
        {title && (
          <h4 className={`font-semibold ${titleColors[variant]} mb-1`}>
            {title}
          </h4>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
