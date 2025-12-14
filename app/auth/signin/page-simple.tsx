'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Bitcoin, Home, Zap, Github, Coffee, Shield } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Plasma = dynamic(() => import('@/components/ui/Plasma'), { ssr: false });

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/cbaf/dashboard';
  const error = searchParams.get('error');

  const handleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  // Logo images
  const logos = [
    { src: '/logos/afribit-logo.png', alt: 'Afribit' },
    { src: '/logos/blink-dark-bg.png', alt: 'Blink' },
    { src: '/logos/fedi-logo.jpg', alt: 'Fedi' },
    { src: '/logos/manchakura-logo.png', alt: 'Machankura' },
    { src: '/logos/novyrix-logo-transparent.png', alt: 'Novyrix' },
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
          opacity={0.12}
          mouseInteractive={true}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-[1]" />

      {/* Floating Navigation - Dark Theme */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-bitcoin-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-white text-lg">AFRIBITOOLS</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/fastlight" 
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Fastlight</span>
            </Link>
            <Link 
              href="https://github.com/Afribit-Africa/tools" 
              target="_blank"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Link>
            <Link 
              href="mailto:support@afribit.africa"
              className="flex items-center gap-2 px-4 py-2 bg-bitcoin-500 hover:bg-bitcoin-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <Coffee className="w-4 h-4" />
              <span>Support Us</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          {/* Logo Carousel - Minimalistic */}
          <div className="mb-8 overflow-hidden">
            <div className="flex gap-6 animate-scroll-slow items-center justify-center py-4">
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-16 h-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2 flex items-center justify-center"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={48}
                    height={48}
                    className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

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

          {/* Sign In Card - Glass Effect */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
      </div>

      {/* Scroll Animation Keyframes */}
      <style jsx>{`
        @keyframes scroll-slow {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-slow {
          animation: scroll-slow 30s linear infinite;
        }
      `}</style>
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
