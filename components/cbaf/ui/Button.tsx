import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  darkMode?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon: Icon,
      iconPosition = 'left',
      darkMode = true,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

    const lightVariantClasses = {
      primary: 'bg-bitcoin-500 hover:bg-bitcoin-600 active:bg-bitcoin-700 text-white shadow-sm hover:shadow-md',
      secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-300 shadow-sm',
      outline: 'bg-transparent hover:bg-bitcoin-50 active:bg-bitcoin-100 text-bitcoin-600 border-2 border-bitcoin-500',
      ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700',
      danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-sm',
    };

    const darkVariantClasses = {
      primary: 'bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]',
      secondary: 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white',
      outline: 'bg-transparent hover:bg-bitcoin-500/20 border-2 border-bitcoin-500/50 hover:border-bitcoin-500 text-bitcoin-400 hover:text-bitcoin-300',
      ghost: 'text-white/70 hover:text-white hover:bg-white/5',
      danger: 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = darkMode ? darkVariantClasses : lightVariantClasses;
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
