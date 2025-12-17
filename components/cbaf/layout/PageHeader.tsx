'use client';

import { ReactNode } from 'react';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  icon?: LucideIcon;
  darkMode?: boolean;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  icon: Icon,
  darkMode = true,
}: PageHeaderProps) {
  const bgClass = darkMode ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-white border-b border-gray-200';
  const titleColor = darkMode ? 'text-white' : 'text-gray-900';
  const descColor = darkMode ? 'text-white/60' : 'text-gray-600';
  const iconBg = darkMode ? 'bg-bitcoin-500/20' : 'bg-bitcoin-50';
  const iconColor = darkMode ? 'text-bitcoin-400' : 'text-bitcoin-600';

  return (
    <header className={`${bgClass} sticky top-16 z-20`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} darkMode={darkMode} />
          </div>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {Icon && (
              <div className={`p-3 ${iconBg} rounded-xl flex-shrink-0`}>
                <Icon className={`w-7 h-7 ${iconColor}`} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className={`text-3xl font-heading font-bold ${titleColor} mb-1`}>
                {title}
              </h1>
              {description && (
                <p className={`text-base ${descColor} mt-1`}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}