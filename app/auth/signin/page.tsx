'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Bitcoin, Zap, Globe, Wallet, Network, Coins, TrendingUp, Users, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LogoCarousel from '@/components/ui/LogoCarousel';

const Plasma = dynamic(() => import('@/components/ui/Plasma'), { ssr: false });

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/cbaf/dashboard';
  const error = searchParams.get('error');

  const handleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  // Partner/Tech logos for carousel
  const logos = [
    { name: 'Bitcoin', icon: <Bitcoin className="w-10 h-10" /> },
    { name: 'Lightning', icon: <Zap className="w-10 h-10" /> },
    { name: 'BTCMap', icon: <Globe className="w-10 h-10" /> },
    { name: 'Blink', icon: <Wallet className="w-10 h-10" /> },
    { name: 'Network', icon: <Network className="w-10 h-10" /> },
    { name: 'Satoshi', icon: <Coins className="w-10 h-10" /> },
  ];

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Plasma Background */}
      <div className="absolute inset-0 z-0">
        <Plasma
          color="#f7931a"
          speed={0.5}
          direction="forward"
          scale={1.2}
          opacity={0.15}
          mouseInteractive={true}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-[1]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-bitcoin-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white">CBAF</h2>
              <p className="text-xs text-white/60">Circular Bitcoin Africa Fund</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </nav>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
                <Star className="w-4 h-4 text-bitcoin-400" />
                <span className="text-sm font-medium text-white/90">Trusted by Bitcoin economies across Africa</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight">
                Building the<br />
                <span className="bg-gradient-to-r from-bitcoin-400 via-orange-400 to-bitcoin-500 bg-clip-text text-transparent">
                  Bitcoin Circular Economy
                </span>
              </h1>

              <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                Empowering communities to create sustainable Bitcoin ecosystems through transparent funding and merchant adoption.
              </p>
            </div>

            {/* Sign In Card */}
            <div className="max-w-md mx-auto">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-red-300 text-sm text-center font-medium">
                    {error === 'OAuthSignin' && 'Error connecting to Google. Please try again.'}
                    {error === 'OAuthCallback' && 'Authentication process interrupted. Please try signing in again.'}
                    {error === 'OAuthCreateAccount' && 'Error creating account. Please try again.'}
                    {error === 'Callback' && 'Authentication failed. Please try again.'}
                    {error === 'AccessDenied' && 'Access denied. Please contact an administrator.'}
                    {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback', 'AccessDenied'].includes(error) &&
                      'An error occurred. Please try again.'}
                  </p>
                </div>
              )}

              {/* Glass Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">Welcome</h2>
                  <p className="text-white/60">Sign in to access your dashboard</p>
                </div>

                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] group"
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

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50">
                  <Shield className="w-4 h-4" />
                  <span>Secured with OAuth 2.0</span>
                </div>
              </div>

              {/* Legal Links */}
              <div className="mt-6 text-center text-sm text-white/50">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-bitcoin-400 hover:text-bitcoin-300 font-medium transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-bitcoin-400 hover:text-bitcoin-300 font-medium transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <TrendingUp className="w-8 h-8 text-bitcoin-400" />,
                  title: 'Track Growth',
                  description: 'Monitor merchant adoption and economy rankings in real-time'
                },
                {
                  icon: <Zap className="w-8 h-8 text-bitcoin-400" />,
                  title: 'Instant Payments',
                  description: 'Receive Lightning Network payments directly to your wallet'
                },
                {
                  icon: <Users className="w-8 h-8 text-bitcoin-400" />,
                  title: 'Build Community',
                  description: 'Connect with economies building the circular economy'
                }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logo Carousel at Bottom */}
        <div className="py-12 border-t border-white/10">
          <div className="text-center mb-8">
            <p className="text-sm text-white/50 uppercase tracking-wider font-medium">Powered by Bitcoin Technology</p>
          </div>
          <LogoCarousel logos={logos} speed={40} />
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Bitcoin className="w-12 h-12 text-bitcoin-500 animate-spin" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
