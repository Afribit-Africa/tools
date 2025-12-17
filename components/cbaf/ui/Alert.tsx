import { HTMLAttributes, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, LucideIcon } from 'lucide-react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  darkMode?: boolean;
}

const defaultIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const lightVariantClasses = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

const darkVariantClasses = {
  success: 'alert-success-dark',
  error: 'alert-error-dark',
  warning: 'alert-warning-dark',
  info: 'alert-info-dark',
};

const lightIconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

const darkIconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

const lightTitleColors = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
};

const darkTitleColors = {
  success: 'text-green-300',
  error: 'text-red-300',
  warning: 'text-yellow-300',
  info: 'text-blue-300',
};

const lightTextColors = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700',
};

const darkTextColors = {
  success: 'text-green-400/80',
  error: 'text-red-400/80',
  warning: 'text-yellow-400/80',
  info: 'text-blue-400/80',
};

export default function Alert({
  variant = 'info',
  title,
  children,
  icon,
  darkMode = true,
  className = '',
  ...props
}: AlertProps) {
  const Icon = icon || defaultIcons[variant];
  const variantClasses = darkMode ? darkVariantClasses : lightVariantClasses;
  const iconColors = darkMode ? darkIconColors : lightIconColors;
  const titleColors = darkMode ? darkTitleColors : lightTitleColors;
  const textColors = darkMode ? darkTextColors : lightTextColors;

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
