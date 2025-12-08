'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Server Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in. Please contact an administrator.',
    },
    Verification: {
      title: 'Verification Failed',
      description: 'The verification token has expired or has already been used.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.',
    },
  };

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <div className="max-w-md w-full">
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-heading font-bold text-center mb-2">
            {errorInfo.title}
          </h1>

          <p className="text-text-secondary text-center mb-6">
            {errorInfo.description}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/signin"
              className="btn-primary text-center"
            >
              Try Again
            </Link>

            <Link
              href="/"
              className="btn-secondary text-center"
            >
              Go Home
            </Link>
          </div>

          {error && (
            <p className="text-xs text-text-muted text-center mt-4">
              Error code: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
