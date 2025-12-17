import { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  darkMode?: boolean;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  darkMode = true,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClass = darkMode 
    ? 'animate-pulse bg-white/10' 
    : 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height || (variant === 'text' ? '1rem' : undefined),
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
}

// Skeleton Components for common patterns
export function SkeletonCard({ darkMode = true }: { darkMode?: boolean }) {
  return (
    <div className={darkMode ? 'glass-card' : 'card'}>
      <Skeleton darkMode={darkMode} variant="rectangular" height={200} className="mb-4" />
      <Skeleton darkMode={darkMode} width="60%" className="mb-2" />
      <Skeleton darkMode={darkMode} width="100%" className="mb-2" />
      <Skeleton darkMode={darkMode} width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, darkMode = true }: { rows?: number; darkMode?: boolean }) {
  return (
    <div className={darkMode ? 'table-dark-container' : 'card'}>
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex gap-4">
          <Skeleton darkMode={darkMode} width="25%" height={20} />
          <Skeleton darkMode={darkMode} width="25%" height={20} />
          <Skeleton darkMode={darkMode} width="25%" height={20} />
          <Skeleton darkMode={darkMode} width="25%" height={20} />
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton darkMode={darkMode} width="25%" height={16} />
            <Skeleton darkMode={darkMode} width="25%" height={16} />
            <Skeleton darkMode={darkMode} width="25%" height={16} />
            <Skeleton darkMode={darkMode} width="25%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonText({ 
  lines = 3, 
  darkMode = true 
}: { 
  lines?: number; 
  darkMode?: boolean;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          darkMode={darkMode}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}
