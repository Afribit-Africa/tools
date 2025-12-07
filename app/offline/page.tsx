'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home after a brief delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Check initial status
    setIsOnline(navigator.onLine);

    // Add listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/');
    } else {
      alert('Still offline. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 bg-status-warning/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <WifiOff className="w-12 h-12 text-status-warning" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">No Internet Connection</h1>
          <p className="text-text-secondary">
            {isOnline
              ? 'Connection restored! Redirecting...'
              : 'Please check your internet connection and try again.'}
          </p>
        </div>

        {!isOnline && (
          <button onClick={handleRetry} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </button>
        )}

        {isOnline && (
          <div className="inline-flex items-center gap-2 text-status-success">
            <div className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
            Connected
          </div>
        )}

        <div className="mt-12 p-6 bg-bg-secondary rounded-lg border border-border text-left">
          <h3 className="font-semibold mb-3">Troubleshooting Tips:</h3>
          <ul className="text-sm text-text-secondary space-y-2">
            <li>• Check your WiFi or cellular connection</li>
            <li>• Restart your router or modem</li>
            <li>• Check if other devices can connect</li>
            <li>• Contact your ISP if the issue persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
