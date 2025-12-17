'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  darkMode?: boolean;
}

export default function Breadcrumbs({ items, darkMode = true }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const textColor = darkMode ? 'text-white/50' : 'text-gray-500';
  const hoverColor = darkMode ? 'hover:text-white' : 'hover:text-gray-700';
  const activeColor = darkMode ? 'text-white' : 'text-gray-900';
  const separatorColor = darkMode ? 'text-white/30' : 'text-gray-400';

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={`${textColor} ${hoverColor} font-medium transition-colors`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${isLast ? activeColor : textColor} font-medium`}>
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight className={`w-4 h-4 mx-2 ${separatorColor}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Utility function to generate breadcrumbs from pathname
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}