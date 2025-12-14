import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, LucideIcon } from 'lucide-react';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
  variant?: 'black' | 'white';
  icon?: LucideIcon;
}

export default function Header({
  title,
  subtitle,
  actions,
  backLink,
  variant = 'black',
  icon: Icon,
}: HeaderProps) {
  const headerClass = variant === 'black' ? 'header-black' : 'bg-white border-b border-gray-200';
  const textClass = variant === 'black' ? 'text-white' : 'text-gray-900';
  const subtitleClass = variant === 'black' ? 'text-gray-300' : 'text-gray-600';

  return (
    <header className={headerClass}>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backLink && (
              <Link
                href={backLink.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  variant === 'black'
                    ? 'hover:bg-white/10 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{backLink.label}</span>
              </Link>
            )}

            <div>
              <h1 className={`text-3xl font-heading font-bold ${textClass} flex items-center gap-3`}>
                {Icon && <Icon className="w-8 h-8" />}
                {title}
              </h1>
              {subtitle && (
                <p className={`${subtitleClass} mt-1`}>{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
