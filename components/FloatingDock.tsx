'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Home, Zap, Github, Coffee, Menu, X } from 'lucide-react';

export function FloatingDock() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/fastlight', label: 'Fastlight', icon: Zap },
    { href: 'https://github.com/Afribit-Africa/tools', label: 'GitHub', icon: Github, external: true },
  ];

  return (
    <>
      {/* Desktop Floating Dock */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 hidden md:block ${
          isScrolled ? 'top-4' : 'top-8'
        }`}
      >
        <nav className="bg-bg-secondary/80 backdrop-blur-xl border border-border/50 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 pr-4 border-r border-border/50">
              <div className="w-8 h-8 bg-gradient-to-br from-bitcoin to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-brand text-lg text-bitcoin font-bold">AFRIBITOOLS</span>
            </Link>

            {/* Nav Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-bitcoin/10 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-text-secondary group-hover:text-bitcoin transition-colors" />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-bitcoin transition-colors">
                    {item.label}
                  </span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-bitcoin/10 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-text-secondary group-hover:text-bitcoin transition-colors" />
                  <span className="text-sm font-medium text-text-secondary group-hover:text-bitcoin transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Donate Button */}
            <a
              href="https://donate.afribit.africa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-bitcoin to-orange-600 rounded-full hover:shadow-lg hover:shadow-bitcoin/30 transition-all duration-200 ml-2"
            >
              <Coffee className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Support Us</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-bg-secondary/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-bitcoin to-orange-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-brand text-lg text-bitcoin font-bold">AFRIBITOOLS</span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-bitcoin/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-bg-secondary/95 backdrop-blur-xl border-b border-border/50 py-4 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bitcoin/10 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 text-bitcoin" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bitcoin/10 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 text-bitcoin" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <a
                href="https://donate.afribit.africa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-bitcoin to-orange-600 rounded-lg hover:shadow-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Coffee className="w-5 h-5 text-white" />
                <span className="font-medium text-white">Support Us</span>
              </a>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
