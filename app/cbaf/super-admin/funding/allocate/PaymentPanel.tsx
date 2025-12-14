'use client';

import { useState } from 'react';
import { Send, Zap, AlertCircle, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationSystem';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface PaymentPanelProps {
  period: string;
  disbursements: any[];
  onPaymentComplete?: () => void;
}

export default function PaymentPanel({
  period,
  disbursements,
  onPaymentComplete,
}: PaymentPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentResults, setPaymentResults] = useState<any>(null);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { showSuccess, showError } = useNotification();

  const pendingDisbursements = disbursements.filter((d) => d.status === 'pending');
  const readyForPayment = pendingDisbursements.filter((d) => d.lightningAddress);
  const missingAddresses = pendingDisbursements.filter((d) => !d.lightningAddress);

  const totalAmount = readyForPayment.reduce((sum, d) => sum + (d.amountSats || 0), 0);

  const fetchWalletBalance = async () => {
    setLoadingBalance(true);
    try {
      const response = await fetch('/api/cbaf/payments/wallet');
      const data = await response.json();

      if (response.ok) {
        setWalletBalance(data.balance);
      } else {
        showError('Failed to fetch wallet balance');
      }
    } catch (error) {
      showError('Failed to connect to wallet');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleVerifyAddresses = async () => {
    setIsVerifying(true);
    setVerificationResults(null);

    try {
      const addresses = readyForPayment.map(d => d.lightningAddress);

      const response = await fetch('/api/cbaf/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationResults(data);

      const invalidCount = data.results.filter((r: any) => !r.valid).length;

      if (invalidCount === 0) {
        showSuccess('All Lightning addresses verified successfully!');
      } else {
        showError(`${invalidCount} invalid address${invalidCount !== 1 ? 'es' : ''} found`);
      }

    } catch (error) {
      showError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenConfirmModal = () => {
    fetchWalletBalance();
    setShowConfirmModal(true);
  };

  const handleProcessPayments = async () => {
    if (readyForPayment.length === 0) {
      showError('No payments ready to process');
      return;
    }

    setShowConfirmModal(false);
    setIsProcessing(true);
    setPaymentResults(null);

    try {
      const response = await fetch('/api/cbaf/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          economyIds: readyForPayment.map((d) => d.economyId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payments');
      }

      setPaymentResults(data);

      if (data.successCount > 0) {
        showSuccess(`${data.successCount} payment${data.successCount !== 1 ? 's' : ''} sent successfully!`);
      }

      if (data.failureCount > 0) {
        showError(`${data.failureCount} payment${data.failureCount !== 1 ? 's' : ''} failed`);
      }

      // Callback to refresh data
      if (onPaymentComplete) {
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate statistics
  const completedCount = disbursements.filter((d) => d.status === 'completed').length;
  const failedCount = disbursements.filter((d) => d.status === 'failed').length;
  const completedAmount = disbursements
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + (d.amountSats || 0), 0);

  return (
    <div className="space-y-6">
      {/* Payment Status Overview */}
      <div className="card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Lightning Payments
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Process payments for {period}
            </p>
          </div>
          {readyForPayment.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleVerifyAddresses}
                disabled={isVerifying || isProcessing}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Verify Addresses
                  </>
                )}
              </button>
              <button
                onClick={handleOpenConfirmModal}
                disabled={isProcessing}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Payments
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Ready to Pay</div>
            <div className="text-2xl font-bold text-blue-600">
              {readyForPayment.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(totalAmount / 1_000_000).toFixed(2)}M sats
            </div>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {(completedAmount / 1_000_000).toFixed(2)}M sats
            </div>
          </div>

          <div className="p-4 bg-red-500/10 rounded-lg">
            <div className="text-sm text-red-700 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">
              {failedCount}
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <div className="text-sm text-yellow-700 mb-1">Missing Address</div>
            <div className="text-2xl font-bold text-yellow-600">
              {missingAddresses.length}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {missingAddresses.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">
                {missingAddresses.length} disbursement{missingAddresses.length !== 1 ? 's' : ''} missing Lightning addresses
              </p>
              <p className="mt-1 text-yellow-600">
                These payments cannot be processed until Lightning addresses are provided
              </p>
            </div>
          </div>
        )}

        {readyForPayment.length === 0 && completedCount === 0 && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
            <p className="text-sm text-blue-600">
              No payments ready to process. Calculate funding allocation first.
            </p>
          </div>
        )}
      </div>

      {/* Payment Results */}
      {paymentResults && (
        <div className="card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-heading font-bold">Payment Results</h3>
            <p className="text-sm text-gray-500 mt-1">
              {paymentResults.successCount} successful • {paymentResults.failureCount} failed
            </p>
          </div>

          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {paymentResults.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  result.success
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm truncate">
                    {result.lightningAddress}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Economy ID: {result.economyId}
                  </div>
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Payments List */}
      {readyForPayment.length > 0 && (
        <div className="card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-heading font-bold">Pending Payments</h3>
            <p className="text-sm text-gray-500 mt-1">
              {readyForPayment.length} payment{readyForPayment.length !== 1 ? 's' : ''} ready to send
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium">Economy</th>
                  <th className="text-left p-4 font-medium">Lightning Address</th>
                  <th className="text-right p-4 font-medium">Amount (sats)</th>
                  <th className="text-center p-4 font-medium">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {readyForPayment.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-medium">{d.economyName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-gray-600">
                        {d.lightningAddress}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold">
                        {(d.amountSats / 1000).toFixed(0)}k
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-medium">#{d.overallRank}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleProcessPayments}
        title="Send Lightning Payments"
        message={
          <div className="space-y-3">
            <p>
              You are about to send <strong>{readyForPayment.length}</strong> Lightning payments
              totaling <strong>{(totalAmount / 1_000_000).toFixed(2)}M sats</strong>.
            </p>

            {/* Wallet Balance */}
            {loadingBalance ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Checking wallet balance...</span>
              </div>
            ) : walletBalance !== null ? (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Current Wallet Balance:</span>
                  <span className="font-bold text-blue-600">
                    {(walletBalance / 1_000_000).toFixed(2)}M sats
                  </span>
                </div>
                {walletBalance < totalAmount && (
                  <div className="mt-2 text-xs text-red-600">
                    ⚠️ Insufficient balance for all payments
                  </div>
                )}
                {walletBalance >= totalAmount && (
                  <div className="mt-2 text-xs text-green-600">
                    ✅ Sufficient balance available
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ Could not verify wallet balance
                </p>
              </div>
            )}

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ This action cannot be undone. Payments will be sent immediately.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Processing time: approximately {readyForPayment.length} seconds
              (1 payment per second)
            </p>
          </div>
        }
        confirmText="Send Payments"
        type="warning"
      />
    </div>
  );
}
