'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface BulkVerifyButtonProps {
  economyId: string;
  economyName: string;
}

export default function BulkVerifyButton({ economyId, economyName }: BulkVerifyButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    verified: number;
    failed: number;
  } | null>(null);

  const handleBulkVerify = async () => {
    if (!confirm(`Verify all merchants for ${economyName}? This may take a few minutes.`)) {
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const response = await fetch(`/api/cbaf/merchants/verify?economyId=${economyId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bulk verification failed');
      }

      setResult({
        total: data.total,
        verified: data.verified,
        failed: data.failed,
      });

      // Refresh the page after a delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Bulk verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleBulkVerify}
        disabled={isVerifying}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isVerifying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Verify All
          </>
        )}
      </button>

      {result && (
        <div className="text-xs text-center">
          <p className="text-green-500">✓ {result.verified} verified</p>
          {result.failed > 0 && <p className="text-red-500">✗ {result.failed} failed</p>}
        </div>
      )}
    </div>
  );
}
