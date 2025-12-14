'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Bitcoin, Shield, Sparkles, TrendingUp, Check } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/cbaf/dashboard';
  const error = searchParams.get('error');

  const handleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-bitcoin-50/30 to-gray-50">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bitcoin-600 via-bitcoin-500 to-orange-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Bitcoin className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">CBAF</h2>
              <p className="text-xs text-white/80">Circular Bitcoin Africa Fund</p>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Trusted by economies across Africa</span>
              </div>

              <h1 className="text-5xl font-heading font-bold text-white mb-4 leading-tight">
                Building the<br />
                Bitcoin Circular<br />
                Economy
              </h1>

              <p className="text-xl text-white/90 leading-relaxed max-w-md">
                Empowering communities to create sustainable Bitcoin ecosystems through transparent funding and merchant adoption.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-4">
              {[
                'Submit proof-of-work videos and earn rewards',
                'Track merchant adoption and growth metrics',
                'Receive instant Lightning Network payments',
                'Compete in transparent monthly rankings'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">10+</div>
            <div className="text-sm text-white/70">Active Economies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">100+</div>
            <div className="text-sm text-white/70">Merchants Onboarded</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">5M+</div>
            <div className="text-sm text-white/70">Sats in Funding Pool</div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-bitcoin-500 to-bitcoin-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bitcoin className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">CBAF</h2>
              <p className="text-xs text-gray-600">Circular Bitcoin Africa Fund</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm text-center font-medium">
                {error === 'OAuthSignin' && 'Error connecting to Google. Please try again.'}
                {error === 'OAuthCallback' && 'Authentication process interrupted. Please try signing in again.'}
                {error === 'OAuthCreateAccount' && 'Error creating account. Please try again.'}
                {error === 'Callback' && 'Authentication failed. Please try again.'}
                {error === 'AccessDenied' && 'Access denied. Please contact an administrator.'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback', 'AccessDenied'].includes(error) &&
                  'An error occurred. Please try again.'}
              </p>
              <p className="text-red-600 text-xs text-center mt-2">
                If this problem persists, try clearing your browser cookies or contact support.
              </p>
            </div>
          )}

          {/* Sign In Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-bitcoin-600 hover:text-bitcoin-700 font-medium">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-bitcoin-600 hover:text-bitcoin-700 font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Secured with OAuth 2.0 & 256-bit encryption</span>
          </div>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <Link
              href="mailto:support@afribitools.com"
              className="text-sm text-gray-600 hover:text-bitcoin-600 font-medium"
            >
              Need help? Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bitcoin className="w-12 h-12 text-bitcoin-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
