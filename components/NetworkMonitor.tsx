'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff } from 'lucide-react';

export function NetworkMonitor() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);

      // Redirect to offline page after a short delay
      setTimeout(() => {
        if (!navigator.onLine) {
          router.push('/offline');
        }
      }, 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  if (!showOfflineBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-status-warning text-white py-2 px-4 text-center text-sm font-medium animate-slide-down">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>No internet connection. Redirecting to offline page...</span>
      </div>
    </div>
  );
}
