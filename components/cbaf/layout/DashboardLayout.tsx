'use client';

import { ReactNode } from 'react';
import Sidebar, { SidebarProps } from './Sidebar';

export interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: SidebarProps;
  darkMode?: boolean;
}

export default function DashboardLayout({
  children,
  sidebar,
  darkMode = true,
}: DashboardLayoutProps) {
  const bgClass = darkMode ? 'bg-black' : 'bg-gray-50';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Sidebar */}
      {sidebar && <Sidebar {...sidebar} />}

      {/* Main Content */}
      <main className={sidebar ? 'lg:pl-64' : ''}>
        <div className="pt-16">
          {children}
        </div>
      </main>
    </div>
  );
}