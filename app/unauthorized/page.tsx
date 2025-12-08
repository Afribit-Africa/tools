import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-block p-4 bg-red-500/10 rounded-full">
          <Shield className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-heading font-bold mb-2">
          Access Denied
        </h1>

        <p className="text-text-secondary mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-primary"
          >
            Go to Homepage
          </Link>

          <Link
            href="/auth/signin"
            className="btn-secondary"
          >
            Sign in with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
