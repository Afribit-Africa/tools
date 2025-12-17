import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  required?: boolean;
  darkMode?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = 'left',
      required,
      darkMode = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputClass = darkMode 
      ? error ? 'input-dark-error' : 'input-dark'
      : error ? 'input-error' : 'input';
    
    const labelClass = darkMode ? 'label-dark' : 'label';
    const iconColor = darkMode ? 'text-white/40' : 'text-gray-400';
    const errorTextClass = darkMode ? 'text-xs text-red-400 mt-1 font-medium' : 'error-text';
    const helperTextClass = darkMode ? 'text-xs text-white/50 mt-1' : 'helper-text';

    return (
      <div className="space-y-2">
        {label && (
          <label className={labelClass}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}

          <input
            ref={ref}
            className={`${inputClass} ${
              Icon && iconPosition === 'left' ? 'pl-10' : ''
            } ${Icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`}
            {...props}
          />

          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
        </div>

        {error && <p className={errorTextClass}>{error}</p>}
        {helperText && !error && <p className={helperTextClass}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
