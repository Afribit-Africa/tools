import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  darkMode?: boolean;
}

export function Card({ children, hover = false, darkMode = true, className = '', ...props }: CardProps) {
  let classes = '';
  
  if (darkMode) {
    classes = hover ? `glass-card-hover ${className}` : `glass-card ${className}`;
  } else {
    classes = hover ? `card-hover ${className}` : `card ${className}`;
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  darkMode?: boolean;
}

export function CardTitle({ children, darkMode = true, className = '', ...props }: CardTitleProps) {
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  return (
    <h3 className={`text-lg font-heading font-semibold ${textColor} ${className}`} {...props}>
      {children}
    </h3>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  darkMode?: boolean;
}

export function CardFooter({ children, darkMode = true, className = '', ...props }: CardFooterProps) {
  const borderColor = darkMode ? 'border-white/10' : 'border-gray-200';
  return (
    <div className={`mt-4 pt-4 border-t ${borderColor} ${className}`} {...props}>
      {children}
    </div>
  );
}
