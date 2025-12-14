/**
 * Floating Navigation Component
 *
 * Centrally placed, rounded floating nav with:
 * - Backdrop blur
 * - Smooth animations
 * - Logout functionality
 * - Active state indicators
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Building2,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useConfirmation } from './ConfirmationModal';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

interface FloatingNavProps {
  role: 'super_admin' | 'admin' | 'bce';
}

export default function FloatingNav({ role }: FloatingNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { confirm, ConfirmationDialog } = useConfirmation();

  const superAdminNav: NavItem[] = [
    { href: '/cbaf/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cbaf/super-admin/rankings', label: 'Rankings', icon: TrendingUp },
    { href: '/cbaf/super-admin/funding', label: 'Funding', icon: DollarSign },
    { href: '/cbaf/super-admin/economies', label: 'Economies', icon: Building2 },
    { href: '/cbaf/super-admin/settings', label: 'Settings', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { href: '/cbaf/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cbaf/admin/reviews', label: 'Reviews', icon: TrendingUp },
    { href: '/cbaf/admin/economies', label: 'Economies', icon: Building2 },
  ];

  const bceNav: NavItem[] = [
    { href: '/cbaf/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cbaf/videos', label: 'Videos', icon: TrendingUp },
    { href: '/cbaf/merchants', label: 'Merchants', icon: Building2 },
  ];

  const navItems = role === 'super_admin' ? superAdminNav : role === 'admin' ? adminNav : bceNav;

  const handleLogout = () => {
    confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of your account?',
      type: 'info',
      confirmText: 'Logout',
      cancelText: 'Stay',
      onConfirm: () => signOut({ callbackUrl: '/' })
    });
  };

  return (
    <>
      {/* Desktop Floating Nav */}
      <nav className="hidden md:block fixed top-6 left-1/2 transform -translate-x-1/2 z-40 animate-slideDown">
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border-2 border-gray-100 px-3 py-2">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full
                    transition-all duration-200 font-medium text-sm
                    ${isActive
                      ? 'bg-bitcoin-500 text-white shadow-lg shadow-bitcoin-500/30'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 mx-1" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-6 right-6 z-50 p-3 bg-white rounded-full shadow-xl border-2 border-gray-100"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-900" />
        ) : (
          <Menu className="w-6 h-6 text-gray-900" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="md:hidden fixed inset-x-4 top-24 z-40 animate-slideDown">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200 font-medium
                        ${isActive
                          ? 'bg-bitcoin-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="h-px bg-gray-200 my-2" />

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {ConfirmationDialog}
    </>
  );
}
