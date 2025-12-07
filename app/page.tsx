import Link from 'next/link';
import { Zap, ArrowRight, CheckCircle, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { FloatingDock } from '@/components/FloatingDock';
import { DonateSection } from '@/components/DonateSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <FloatingDock />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-bitcoin/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bitcoin/10 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bitcoin/10 border border-bitcoin/30 rounded-full backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-bitcoin" />
              <span className="text-bitcoin text-sm font-medium">
                Bitcoin Circular Economy Tools
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-balance leading-tight">
              Streamline Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bitcoin via-orange-500 to-bitcoin animate-gradient">
                Bitcoin Operations
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              All-in-one solution for organizations building the Bitcoin circular economy.
              Verify, manage, and scale your Bitcoin workflows with ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link 
                href="/fastlight" 
                className="btn-primary group text-lg px-8 py-4"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#modules" 
                className="btn-secondary text-lg px-8 py-4"
              >
                Explore Modules
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-bitcoin mb-2">10K+</div>
                <div className="text-sm text-text-muted">Addresses Validated</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-bitcoin mb-2">100%</div>
                <div className="text-sm text-text-muted">Open Source</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-bitcoin mb-2">0 Fees</div>
                <div className="text-sm text-text-muted">Always Free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Why Choose <span className="text-bitcoin">Afribitools</span>
            </h2>
            <p className="text-xl text-text-secondary">
              Built for the Bitcoin circular economy, by Bitcoin enthusiasts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover group">
              <div className="w-14 h-14 bg-bitcoin/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bitcoin/30 transition-colors">
                <Zap className="w-8 h-8 text-bitcoin" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">Lightning Fast</h3>
              <p className="text-text-secondary">
                Process thousands of addresses in minutes with our optimized batch processing
              </p>
            </div>

            <div className="card-hover group">
              <div className="w-14 h-14 bg-bitcoin/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bitcoin/30 transition-colors">
                <Shield className="w-8 h-8 text-bitcoin" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">Secure & Private</h3>
              <p className="text-text-secondary">
                No data stored on servers. Your information stays local with automatic cleanup
              </p>
            </div>

            <div className="card-hover group">
              <div className="w-14 h-14 bg-bitcoin/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bitcoin/30 transition-colors">
                <TrendingUp className="w-8 h-8 text-bitcoin" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">Built to Scale</h3>
              <p className="text-text-secondary">
                From 10 to 10,000+ addresses, our tools grow with your organization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Available <span className="text-bitcoin">Modules</span>
            </h2>
            <p className="text-xl text-text-secondary">
              Purpose-built tools for Bitcoin circular economy organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fastlight Module */}
            <Link href="/fastlight" className="card-hover group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-bitcoin/5 rounded-full blur-3xl group-hover:bg-bitcoin/10 transition-colors" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-bitcoin to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <span className="badge-success text-xs">Active</span>
                </div>

                <h3 className="text-2xl font-heading font-bold mb-3 group-hover:text-bitcoin transition-colors">
                  Fastlight
                </h3>

                <p className="text-text-secondary mb-6 leading-relaxed">
                  Bulk verify and validate Blink lightning addresses. Process CSV/XLSX files
                  with batch payments support.
                </p>

                <div className="flex items-center gap-2 text-sm text-bitcoin font-medium">
                  <span>Explore Fastlight</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border/50">
                  <span className="text-xs px-3 py-1 bg-bitcoin/10 text-bitcoin rounded-full font-medium">CSV Support</span>
                  <span className="text-xs px-3 py-1 bg-bitcoin/10 text-bitcoin rounded-full font-medium">XLSX Support</span>
                  <span className="text-xs px-3 py-1 bg-bitcoin/10 text-bitcoin rounded-full font-medium">Batch Payments</span>
                </div>
              </div>
            </Link>

            {/* Coming Soon Modules */}
            <div className="card relative overflow-hidden opacity-60">
              <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary to-bg-secondary" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-text-muted/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <span className="text-xs px-3 py-1 bg-text-muted/20 text-text-muted rounded-full font-medium">
                    Coming Soon
                  </span>
                </div>

                <h3 className="text-2xl font-heading font-bold mb-3">
                  Analytics Dashboard
                </h3>

                <p className="text-text-secondary mb-6">
                  Track and analyze your Bitcoin circular economy metrics in real-time.
                </p>

                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border/50">
                  <span className="text-xs px-3 py-1 bg-text-muted/10 text-text-muted rounded-full">Charts</span>
                  <span className="text-xs px-3 py-1 bg-text-muted/10 text-text-muted rounded-full">Reports</span>
                  <span className="text-xs px-3 py-1 bg-text-muted/10 text-text-muted rounded-full">Export</span>
                </div>
              </div>
            </div>

            <div className="card relative overflow-hidden opacity-60">
              <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary to-bg-secondary" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-text-muted/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <span className="text-xs px-3 py-1 bg-text-muted/20 text-text-muted rounded-full font-medium">
                    Coming Soon
                  </span>
                </div>

                <h3 className="text-2xl font-heading font-bold mb-3">
                  API Integration
                </h3>

                <p className="text-text-secondary mb-6">
                  Integrate Afribitools directly into your existing systems with our API.
                </p>

                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border/50">
                  <span className="text-xs px-3 py-1 bg-text-muted/10 text-text-muted rounded-full">REST API</span>
                  <span className="text-xs px-3 py-1 bg-text-muted/10 text-text-muted rounded-full">Webhooks</span>
                  <span className="text-xs px-3 py-1 bg-text-muted/10 text-text-muted rounded-full">SDKs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <DonateSection />

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-bitcoin to-orange-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-brand text-lg text-bitcoin font-bold">AFRIBITOOLS</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/fastlight" className="text-sm text-text-secondary hover:text-bitcoin transition-colors">
                Fastlight
              </Link>
              <a
                href="https://github.com/Afribit-Africa/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-secondary hover:text-bitcoin transition-colors"
              >
                GitHub
              </a>
              <Link href="#donate" className="text-sm text-text-secondary hover:text-bitcoin transition-colors">
                Donate
              </Link>
            </div>

            <p className="text-sm text-text-muted">
              © 2025 Afribit Africa. Open Source.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-border rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="badge-pending">Coming Soon</span>
              </div>

              <h4 className="text-xl font-heading font-bold mb-2">
                Analytics
              </h4>

              <p className="text-text-secondary mb-4">
                Track and analyze payment flows in your circular economy network.
              </p>
            </div>

            <div className="card opacity-50 cursor-not-allowed">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-border rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <span className="badge-pending">Coming Soon</span>
              </div>

              <h4 className="text-xl font-heading font-bold mb-2">
                Batch Pay
              </h4>

              <p className="text-text-secondary mb-4">
                Send bulk payments to multiple lightning addresses simultaneously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary py-8">
        <div className="container mx-auto px-4 text-center text-text-muted">
          <p>
            Built with ⚡ by{' '}
            <Link
              href="https://github.com/Afribit-Africa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bitcoin hover:text-bitcoin-light"
            >
              Afribit Africa
            </Link>
          </p>
          <p className="mt-2 text-sm">
            Open source • Bitcoin only • Circular economy focused
          </p>
        </div>
      </footer>
    </main>
  );
}
