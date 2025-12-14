import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono, Audiowide } from 'next/font/google';
import './globals.css';
import { NetworkMonitor } from '@/components/NetworkMonitor';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SessionProvider from '@/lib/auth/SessionProvider';
import { NotificationProvider } from '@/components/ui/NotificationSystem';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const audiowide = Audiowide({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-audiowide',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Afribitools - Bitcoin Circular Economy Tools',
  description: 'All-in-one solution for Bitcoin circular economy organizations. Verify, manage, and scale your Bitcoin workflows with ease.',
  keywords: ['bitcoin', 'lightning', 'blink', 'circular economy', 'africa', 'fastlight', 'batch payments'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${audiowide.variable}`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <NetworkMonitor />
              {children}
            </ErrorBoundary>
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
