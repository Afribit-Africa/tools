import Link from 'next/link';
import { Zap, ArrowRight, Sparkles, Award, BarChart3, Globe } from 'lucide-react';
import { FloatingDock } from '@/components/FloatingDock';
import { DonateSection } from '@/components/DonateSection';
import ClientLogos from '@/components/ClientLogos';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <FloatingDock />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-bitcoin-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bitcoin-500/20 via-transparent to-transparent" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-bitcoin-500" />
              <span className="text-bitcoin-400 text-sm font-medium">
                Bitcoin Circular Economy Tools
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white leading-tight">
              Streamline Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bitcoin-500 via-orange-400 to-bitcoin-500">
                Bitcoin Operations
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              All-in-one solution for organizations building the Bitcoin circular economy.
              Verify, manage, and scale your Bitcoin workflows with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                href="/fastlight"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-bitcoin-500/25 hover:shadow-xl hover:shadow-bitcoin-500/30 hover:scale-[1.02] transition-all duration-200 text-lg group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#modules"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all duration-200 text-lg"
              >
                Explore Modules
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-bitcoin-500 mb-2">2</div>
                <div className="text-sm text-gray-500">Active Modules</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-bitcoin-500 mb-2">100%</div>
                <div className="text-sm text-gray-500">Open Source</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-3xl md:text-4xl font-bold text-bitcoin-500 mb-2">0 Fees</div>
                <div className="text-sm text-gray-500">Always Free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <ClientLogos />

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Available <span className="text-bitcoin-500">Modules</span>
            </h2>
            <p className="text-xl text-gray-400">
              Purpose-built tools for Bitcoin circular economy organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Fastlight Module */}
            <Link href="/fastlight" className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-bitcoin-500/50 transition-all duration-300">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-bitcoin-500/10 rounded-full blur-3xl group-hover:bg-bitcoin-500/20 transition-colors" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-bitcoin-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-bitcoin-500/20 group-hover:scale-110 group-hover:shadow-bitcoin-500/40 transition-all">
                    <Zap className="w-9 h-9 text-white" />
                  </div>
                  <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-bitcoin-400 transition-colors">
                  Fastlight
                </h3>

                <p className="text-gray-400 mb-6 leading-relaxed">
                  Bulk verify and validate Blink lightning addresses. Process CSV/XLSX files
                  with batch payments support. Filter valid/invalid results and export data.
                </p>

                <div className="flex items-center gap-2 text-sm text-bitcoin-500 font-medium mb-6">
                  <span>Explore Fastlight</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                  <span className="text-xs px-3 py-1.5 bg-bitcoin-500/10 border border-bitcoin-500/20 text-bitcoin-400 rounded-full font-medium">CSV Support</span>
                  <span className="text-xs px-3 py-1.5 bg-bitcoin-500/10 border border-bitcoin-500/20 text-bitcoin-400 rounded-full font-medium">XLSX Support</span>
                  <span className="text-xs px-3 py-1.5 bg-bitcoin-500/10 border border-bitcoin-500/20 text-bitcoin-400 rounded-full font-medium">Batch Payments</span>
                </div>
              </div>
            </Link>

            {/* CBAF Module */}
            <Link href="/cbaf/dashboard" className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 group-hover:shadow-orange-500/40 transition-all">
                    <Award className="w-9 h-9 text-white" />
                  </div>
                  <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-2xl font-heading font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                  CBAF Manager
                </h3>

                <p className="text-gray-400 mb-6 leading-relaxed">
                  Circular Bitcoin Africa Fund management system. Track videos, merchants,
                  rankings, and funding allocation for Bitcoin circular economies.
                </p>

                <div className="flex items-center gap-2 text-sm text-orange-500 font-medium mb-6">
                  <span>Explore CBAF</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                  <span className="text-xs px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full font-medium">Video Tracking</span>
                  <span className="text-xs px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full font-medium">Rankings</span>
                  <span className="text-xs px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full font-medium">Funding</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-12">
            <h3 className="text-xl font-heading font-semibold text-gray-400 mb-6 text-center">Coming Soon</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Analytics Dashboard */}
              <div className="relative overflow-hidden bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl p-6 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-heading font-bold text-gray-300">Analytics Dashboard</h4>
                    <p className="text-sm text-gray-500">Track and analyze your Bitcoin circular economy metrics</p>
                  </div>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-500 text-xs font-medium rounded-full">
                    Soon
                  </span>
                </div>
              </div>

              {/* API Integration */}
              <div className="relative overflow-hidden bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-xl p-6 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-heading font-bold text-gray-300">API Integration</h4>
                    <p className="text-sm text-gray-500">Integrate Afribitools directly into your systems</p>
                  </div>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-500 text-xs font-medium rounded-full">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <DonateSection />

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-bitcoin-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-bitcoin-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-brand text-xl text-bitcoin-500 font-bold">AFRIBITOOLS</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/fastlight" className="text-sm text-gray-400 hover:text-bitcoin-500 transition-colors">
                Fastlight
              </Link>
              <Link href="/cbaf/dashboard" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
                CBAF
              </Link>
              <a
                href="https://github.com/Afribit-Africa/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <Link href="#donate" className="text-sm text-gray-400 hover:text-bitcoin-500 transition-colors">
                Donate
              </Link>
            </div>

            <p className="text-sm text-gray-600">
              © 2025 Afribit Africa. Open Source.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
