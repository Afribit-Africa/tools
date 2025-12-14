'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Send, AlertCircle } from 'lucide-react';
import { useConfirmation } from '@/components/ui/ConfirmationModal';

interface Merchant {
  id: string;
  merchantName: string | null;
  localName: string | null;
  lightningAddress: string | null;
  paymentProvider: string | null;
  addressVerified: boolean | null;
  addressVerificationError: string | null;
}

interface AddressVerificationPanelProps {
  videoId: string;
  merchants: Merchant[];
  economyEmail: string | null;
  economyName: string;
}

export default function AddressVerificationPanel({
  videoId,
  merchants,
  economyEmail,
  economyName,
}: AddressVerificationPanelProps) {
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [sendingEmail, setSendingEmail] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { confirm, ConfirmationDialog } = useConfirmation();

  const merchantsWithAddresses = merchants.filter(m => m.lightningAddress);
  const unverifiedCount = merchantsWithAddresses.filter(m => !m.addressVerified).length;
  const verifiedCount = merchantsWithAddresses.filter(m => m.addressVerified).length;
  const invalidCount = merchantsWithAddresses.filter(m => m.addressVerificationError).length;

  const handleVerifyAddress = async (merchantId: string, address: string, provider: string) => {
    setValidating(prev => ({ ...prev, [merchantId]: true }));

    try {
      const response = await fetch('/api/cbaf/admin/verify-merchant-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, address, provider }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.reload(); // Reload to show updated status
      } else {
        alert(`Verification failed: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to verify address');
    } finally {
      setValidating(prev => ({ ...prev, [merchantId]: false }));
    }
  };

  const handleVerifyAll = async () => {
    setValidating({});

    for (const merchant of merchantsWithAddresses) {
      if (!merchant.addressVerified && merchant.lightningAddress && merchant.paymentProvider) {
        setValidating(prev => ({ ...prev, [merchant.id]: true }));

        await handleVerifyAddress(
          merchant.id,
          merchant.lightningAddress,
          merchant.paymentProvider
        );
      }
    }
  };

  const handleSendCorrectionEmail = () => {
    if (!economyEmail) {
      alert('No contact email available for this economy');
      return;
    }

    const invalidAddresses = merchantsWithAddresses.filter(m => m.addressVerificationError);

    if (invalidAddresses.length === 0) {
      alert('No invalid addresses to report');
      return;
    }

    confirm({
      title: 'Send Correction Email',
      message: `This will notify ${economyName} about ${invalidAddresses.length} invalid address(es) to ${economyEmail}. Continue?`,
      type: 'warning',
      confirmText: 'Send Email',
      cancelText: 'Cancel',
      onConfirm: performSendEmail,
    });
  };

  const performSendEmail = async () => {
    setSendingEmail(true);
    setResult(null);

    const invalidAddresses = merchantsWithAddresses.filter(m => m.addressVerificationError);

    try {
      const response = await fetch('/api/cbaf/admin/send-address-correction-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          economyEmail,
          economyName,
          invalidAddresses: invalidAddresses.map(m => ({
            merchantName: m.localName || m.merchantName || 'Unnamed Merchant',
            lightningAddress: m.lightningAddress,
            provider: m.paymentProvider,
            error: m.addressVerificationError,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: 'Email sent successfully!' });
      } else {
        setResult({ success: false, message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to send email' });
    } finally {
      setSendingEmail(false);
    }
  };

  if (merchantsWithAddresses.length === 0) {
    return (
      <>
        {ConfirmationDialog}
        <div className="card">
          <h2 className="text-lg font-heading font-bold mb-4 text-gray-900">Payment Address Verification</h2>
          <p className="text-sm text-gray-500">No payment addresses submitted for this video.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {ConfirmationDialog}
      <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-gray-900">Payment Address Verification</h2>
        {unverifiedCount > 0 && (
          <button
            onClick={handleVerifyAll}
            disabled={Object.keys(validating).length > 0}
            className="btn-secondary text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Verify All
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{verifiedCount}</div>
          <div className="text-xs text-green-600">Verified</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">{unverifiedCount}</div>
          <div className="text-xs text-yellow-600">Pending</div>
        </div>
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-700">{invalidCount}</div>
          <div className="text-xs text-red-600">Invalid</div>
        </div>
      </div>

      {/* Merchant List */}
      <div className="space-y-3 mb-4">
        {merchantsWithAddresses.map((merchant) => (
          <div key={merchant.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                </p>
                <p className="text-xs text-gray-600 font-mono break-all mt-1">
                  {merchant.lightningAddress}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Provider: <span className="capitalize">{merchant.paymentProvider}</span>
                </p>
              </div>

              {merchant.addressVerified ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Verified</span>
                </div>
              ) : validating[merchant.id] ? (
                <Loader2 className="w-5 h-5 animate-spin text-bitcoin-500" />
              ) : merchant.addressVerificationError ? (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Invalid</span>
                </div>
              ) : (
                <button
                  onClick={() => handleVerifyAddress(
                    merchant.id,
                    merchant.lightningAddress!,
                    merchant.paymentProvider || 'other'
                  )}
                  className="text-xs px-3 py-1.5 bg-bitcoin-600 text-white rounded-lg hover:bg-bitcoin-700 transition-colors font-medium"
                >
                  Verify
                </button>
              )}
            </div>

            {merchant.addressVerificationError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {merchant.addressVerificationError}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Email Action */}
      {invalidCount > 0 && economyEmail && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={handleSendCorrectionEmail}
            disabled={sendingEmail}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {sendingEmail ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Correction Email to {economyName}
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Will notify about {invalidCount} invalid address(es)
          </p>

          {result && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              result.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.message}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
