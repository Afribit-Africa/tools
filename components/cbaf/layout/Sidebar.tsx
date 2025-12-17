'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Video, Users, Trophy, Globe, ClipboardList, 
  DollarSign, Settings, Menu, X, Plus, BarChart3,
  type LucideIcon 
} from 'lucide-react';
import { useState } from 'react';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
  requiredRole?: 'bce' | 'admin' | 'super_admin';
}

export interface SidebarProps {
  sections: SidebarSection[];
  userRole?: 'bce' | 'admin' | 'super_admin';
  economyName?: string;
}

export default function Sidebar({ sections, userRole, economyName }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const filteredSections = sections.filter(
    (section) => !section.requiredRole || section.requiredRole === userRole
  );

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/cbaf/dashboard" className="block">
          <h2 className="text-xl font-heading font-bold text-white mb-1">CBAF</h2>
          {economyName && (
            <p className="text-sm text-white/60 truncate">{economyName}</p>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto p-4">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-bitcoin-500/20 text-bitcoin-400 border border-bitcoin-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-bitcoin-500/30 text-bitcoin-400 text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="px-3 py-2 bg-white/5 rounded-xl">
          <p className="text-xs text-white/50">
            Need help? <a href="/support" className="text-bitcoin-400 hover:text-bitcoin-300">Contact Support</a>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-20 bg-black/80 backdrop-blur-xl border-r border-white/10 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 pt-20 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

// Predefined sidebar configurations
export const BCESidebarSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/cbaf/dashboard', icon: Home },
      { label: 'My Videos', href: '/cbaf/videos', icon: Video },
      { label: 'Submit Video', href: '/cbaf/videos/submit', icon: Plus },
      { label: 'Merchants', href: '/cbaf/merchants', icon: Users },
      { label: 'Rankings', href: '/cbaf/rankings', icon: Trophy },
    ],
  },
];

export const AdminSidebarSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/cbaf/dashboard', icon: Home },
    ],
    requiredRole: 'bce',
  },
  {
    title: 'Administration',
    items: [
      { label: 'Video Reviews', href: '/cbaf/admin/reviews', icon: ClipboardList },
      { label: 'Merchants', href: '/cbaf/admin/merchants', icon: Users },
      { label: 'Economies', href: '/cbaf/admin/economies', icon: Globe },
    ],
    requiredRole: 'admin',
  },
];

export const SuperAdminSidebarSections: SidebarSection[] = [
  {
    title: 'Super Admin',
    items: [
      { label: 'Overview', href: '/cbaf/super-admin', icon: BarChart3 },
      { label: 'All Economies', href: '/cbaf/super-admin/economies', icon: Globe },
      { label: 'Rankings', href: '/cbaf/super-admin/rankings', icon: Trophy },
      { label: 'Funding', href: '/cbaf/super-admin/funding', icon: DollarSign },
      { label: 'Settings', href: '/cbaf/super-admin/settings', icon: Settings },
    ],
    requiredRole: 'super_admin',
  },
];