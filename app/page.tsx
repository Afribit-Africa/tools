import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-bitcoin rounded-lg flex items-center justify-center glow-bitcoin">
                <span className="text-2xl">🔧</span>
              </div>
              <h1 className="text-2xl font-brand text-bitcoin">AFRIBITOOLS</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="#modules" className="link text-text-secondary hover:text-bitcoin">
                Modules
              </Link>
              <Link
                href="https://github.com/Afribit-Africa/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="link text-text-secondary hover:text-bitcoin"
              >
                GitHub
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-bitcoin/10 border border-bitcoin/30 rounded-full">
            <span className="text-bitcoin text-sm font-medium">
              Bitcoin Circular Economy Tools
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-heading font-bold text-balance">
            Streamline Your{' '}
            <span className="text-bitcoin">Bitcoin Operations</span>
          </h2>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            All-in-one solution for organizations in the Bitcoin circular economy.
            Build, verify, and manage your Bitcoin workflows with ease.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/fastlight" className="btn-primary">
              Get Started
            </Link>
            <Link href="#modules" className="btn-secondary">
              View Modules
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4 bg-bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-heading font-bold mb-4">
              Available Modules
            </h3>
            <p className="text-text-secondary">
              Purpose-built tools for Bitcoin organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fastlight Module */}
            <Link href="/fastlight" className="card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-bitcoin/20 rounded-lg flex items-center justify-center group-hover:bg-bitcoin/30 transition-colors">
                  <Zap className="w-6 h-6 text-bitcoin" />
                </div>
                <span className="badge-success">Active</span>
              </div>

              <h4 className="text-xl font-heading font-bold mb-2 group-hover:text-bitcoin transition-colors">
                Fastlight
              </h4>

              <p className="text-text-secondary mb-4">
                Bulk verify and clean Blink lightning addresses for mass payments
                to circular economies.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-bg-tertiary rounded">CSV</span>
                <span className="text-xs px-2 py-1 bg-bg-tertiary rounded">XLSX</span>
                <span className="text-xs px-2 py-1 bg-bg-tertiary rounded">Validation</span>
              </div>
            </Link>

            {/* Coming Soon Modules */}
            <div className="card opacity-50 cursor-not-allowed">
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
