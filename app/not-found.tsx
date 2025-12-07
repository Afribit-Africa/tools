import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-heading font-bold text-bitcoin mb-4">404</h1>
          <h2 className="text-3xl font-heading font-bold mb-2">Page Not Found</h2>
          <p className="text-text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link href="/fastlight" className="btn-secondary inline-flex items-center gap-2">
            <Search className="w-5 h-5" />
            Try Fastlight
          </Link>
        </div>

        <div className="mt-12 p-6 bg-bg-secondary rounded-lg border border-border">
          <p className="text-sm text-text-secondary mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-bitcoin hover:underline">
              Home
            </Link>
            <Link href="/fastlight" className="text-bitcoin hover:underline">
              Fastlight - Bulk Address Validator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
