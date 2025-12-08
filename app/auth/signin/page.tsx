'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Bitcoin, Users, TrendingUp, Shield } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/cbaf/dashboard';
  const error = searchParams.get('error');

  const handleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-bitcoin/20 rounded-2xl mb-4">
            <Bitcoin className="w-10 h-10 text-bitcoin" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">
            CBAF Management
          </h1>
          <p className="text-text-secondary">
            Circular Bitcoin Africa Fund
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-500 text-sm text-center">
              {error === 'OAuthSignin' && 'Error connecting to Google. Please try again.'}
              {error === 'OAuthCallback' && 'Error during authentication. Please try again.'}
              {error === 'OAuthCreateAccount' && 'Error creating account. Please try again.'}
              {error === 'Callback' && 'Authentication failed. Please try again.'}
              {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback'].includes(error) &&
                'An error occurred. Please try again.'}
            </p>
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-heading font-semibold mb-4 text-center">
            Sign in to continue
          </h2>

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-text-muted text-center mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-bitcoin/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-bitcoin" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">For Circular Economies</h3>
              <p className="text-xs text-text-muted">
                Submit Proof of Work videos and track your merchants
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-bitcoin/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-bitcoin" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">For Admins</h3>
              <p className="text-xs text-text-muted">
                Review submissions and manage the CBAF program
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-bitcoin/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-bitcoin" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Automated Funding</h3>
              <p className="text-xs text-text-muted">
                Monthly rankings and Lightning payment distribution
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
