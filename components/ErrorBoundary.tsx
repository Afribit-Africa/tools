'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-24 h-24 bg-status-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-status-error" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-2">Something Went Wrong</h1>
              <p className="text-text-secondary mb-4">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-left bg-bg-secondary p-4 rounded-lg border border-border mb-6">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error Details
                  </summary>
                  <pre className="text-xs text-status-error overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={this.handleReset} className="btn-primary inline-flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>
              <Link href="/" className="btn-secondary inline-flex items-center gap-2">
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
