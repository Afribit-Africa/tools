'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface VerifyMerchantButtonProps {
  merchantId: number;
  currentStatus: 'verified' | 'error' | 'pending';
  onVerificationComplete?: () => void;
}

export default function VerifyMerchantButton({
  merchantId,
  currentStatus,
  onVerificationComplete,
}: VerifyMerchantButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cbaf/merchants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Verified: ${data.merchant.merchantName || 'Merchant found'}`,
        });
        onVerificationComplete?.();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Verification failed',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Verification failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${
            currentStatus === 'verified'
              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30'
              : currentStatus === 'error'
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30'
              : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30'
          }
        `}
      >
        {isVerifying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : currentStatus === 'verified' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Re-verify
          </>
        ) : currentStatus === 'error' ? (
          <>
            <XCircle className="w-4 h-4" />
            Retry Verification
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Verify Now
          </>
        )}
      </button>

      {message && (
        <p
          className={`text-xs ${
            message.type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
