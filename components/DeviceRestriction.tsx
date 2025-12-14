'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export function DeviceRestriction() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Check if mobile device
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // Also check screen size
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-black border border-bitcoin-500/20 rounded-2xl p-8 text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          <Smartphone className="w-12 h-12 text-red-400" />
          <div className="text-3xl font-bold text-white">→</div>
          <Monitor className="w-12 h-12 text-bitcoin-400" />
        </div>

        <h1 className="text-2xl font-heading font-bold text-white mb-4">
          Desktop Only Platform
        </h1>

        <p className="text-white/70 mb-6 leading-relaxed">
          <strong className="text-white">Afribitools</strong> is designed exclusively for desktop and laptop devices to provide the best experience for managing Bitcoin circular economies.
        </p>

        <div className="bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-white/80">
            Please access this platform from a desktop or laptop computer to continue.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-white/50">
          <Monitor className="w-4 h-4" />
          <span>Optimized for screens 768px and wider</span>
        </div>
      </div>
    </div>
  );
}
