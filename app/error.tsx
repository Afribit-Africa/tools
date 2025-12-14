'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  // Determine if this is an auth-related error
  const isAuthError = error.message?.toLowerCase().includes('auth') ||
                      error.message?.toLowerCase().includes('session') ||
                      error.digest?.includes('auth');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="w-24 h-24 bg-status-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-status-error" />
          </div>

          <h1 className="text-3xl font-heading font-bold mb-2">
            {isAuthError ? 'Authentication Error' : 'Something Went Wrong'}
          </h1>

          <p className="text-text-secondary mb-4">
            {isAuthError
              ? 'We encountered an issue with authentication. Please try signing in again.'
              : 'We encountered an unexpected error. Our team has been notified and is working on a fix.'
            }
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="text-left bg-bg-secondary p-4 rounded-lg border border-border mb-6">
              <summary className="cursor-pointer text-sm font-medium mb-2 text-text-primary">
                Error Details (Development Only)
              </summary>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-1">Message:</p>
                  <pre className="text-xs text-status-error overflow-auto p-2 bg-bg-primary rounded">
                    {error.message}
                  </pre>
                </div>
                {error.digest && (
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1">Error ID:</p>
                    <pre className="text-xs text-text-primary overflow-auto p-2 bg-bg-primary rounded">
                      {error.digest}
                    </pre>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <p className="text-xs font-semibold text-text-secondary mb-1">Stack Trace:</p>
                    <pre className="text-xs text-text-tertiary overflow-auto p-2 bg-bg-primary rounded max-h-48">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {process.env.NODE_ENV === 'production' && error.digest && (
            <div className="text-left bg-bg-secondary p-4 rounded-lg border border-border mb-6">
              <p className="text-sm text-text-secondary">
                <strong>Error ID:</strong> <code className="text-xs bg-bg-primary px-2 py-1 rounded">{error.digest}</code>
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                Please include this ID if you contact support.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          {isAuthError ? (
            <Link
              href="/auth/signin"
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Sign In
            </Link>
          ) : (
            <Link
              href="/"
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          )}
        </div>

        {process.env.NODE_ENV === 'production' && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-text-secondary mb-2">
              Need help? Contact support
            </p>
            <a
              href="mailto:support@afribit.africa"
              className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">support@afribit.africa</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
