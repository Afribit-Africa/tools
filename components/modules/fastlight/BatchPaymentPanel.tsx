'use client';

import { useState } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import type { ValidationRecord, BlinkAccount, BatchPaymentStats } from '@/types';
import { ProgressBar } from './ProgressBar';

interface BatchPaymentPanelProps {
  records: ValidationRecord[];
  account: BlinkAccount;
  apiKey: string;
  onPaymentComplete: (results: any[]) => void;
}

export function BatchPaymentPanel({
  records,
  account,
  apiKey,
  onPaymentComplete,
}: BatchPaymentPanelProps) {
  const [selectedWalletId, setSelectedWalletId] = useState(account.defaultWalletId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [stats, setStats] = useState<BatchPaymentStats>({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalAmount: 0,
    progress: 0,
  });

  const validRecords = records.filter(
    (r) => (r.status === 'valid' || r.status === 'fixed') && r.amount && r.amount > 0
  );

  const selectedWallet = account.wallets.find((w) => w.id === selectedWalletId);
  const totalAmount = validRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  const hasRecordsWithAmounts = validRecords.length > 0;

  const handleSendPayments = async () => {
    if (!hasRecordsWithAmounts) return;

    setIsProcessing(true);
    setStats({
      total: validRecords.length,
      successful: 0,
      failed: 0,
      pending: validRecords.length,
      totalAmount,
      progress: 0,
    });

    const payments = validRecords.map((r) => ({
      address: r.cleaned,
      amount: r.amount!,
    }));

    try {
      const response = await fetch('/api/fastlight/batch-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          walletId: selectedWalletId,
          payments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onPaymentComplete(data.results);

        const successful = data.results.filter((r: any) => r.success).length;
        const failed = data.results.filter((r: any) => !r.success).length;

        setStats({
          total: validRecords.length,
          successful,
          failed,
          pending: 0,
          totalAmount,
          progress: 100,
        });
      }
    } catch (error) {
      console.error('Batch payment error:', error);
      alert('Failed to process payments. Please try again.');
    } finally {
      setIsProcessing(false);
      setCurrentAction('');
    }
  };

  if (!hasRecordsWithAmounts) {
    return (
      <div className="card bg-status-warning/10 border-status-warning/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-status-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">No Payment Amounts Found</h4>
            <p className="text-sm text-text-secondary">
              Your CSV file needs an "Amount" column with payment amounts in satoshis.
              Add an amount column to your file and re-upload to enable batch payments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="card">
        <h3 className="text-lg font-heading font-bold mb-4">Batch Payment Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Recipients</p>
            <p className="text-2xl font-bold text-bitcoin">{validRecords.length}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Total Amount</p>
            <p className="text-2xl font-bold font-mono">
              {totalAmount.toLocaleString()} sats
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Est. Fees</p>
            <p className="text-2xl font-bold font-mono text-status-success">
              ~0 sats
            </p>
            <p className="text-xs text-text-muted">Free for Blink users</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold font-mono">
              {selectedWallet?.balance.toLocaleString()} sats
            </p>
          </div>
        </div>

        {/* Wallet Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">Select Wallet</label>
          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="input w-full"
            disabled={isProcessing}
          >
            {account.wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.walletCurrency} Wallet ({wallet.balance.toLocaleString()}{' '}
                {wallet.walletCurrency === 'BTC' ? 'sats' : 'cents'})
              </option>
            ))}
          </select>
        </div>

        {/* Balance Warning */}
        {selectedWallet && totalAmount > selectedWallet.balance && (
          <div className="bg-status-error/10 border border-status-error/30 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-status-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-error">
                Insufficient balance. You need {totalAmount.toLocaleString()} sats but only
                have {selectedWallet.balance.toLocaleString()} sats available.
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="mb-6">
            <ProgressBar
              current={stats.successful + stats.failed}
              total={stats.total}
              currentAction={currentAction || 'Processing payments...'}
            />
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendPayments}
          disabled={
            isProcessing ||
            !selectedWallet ||
            totalAmount > selectedWallet.balance ||
            validRecords.length === 0
          }
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Payments...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send {validRecords.length} Payments ({totalAmount.toLocaleString()} sats)
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-4 bg-bitcoin/5 border border-bitcoin/20 rounded-lg p-3">
          <p className="text-xs text-text-secondary">
            Payments will be sent sequentially with a small delay between each to ensure
            reliability. All payments to Blink addresses are <strong>free</strong> with no
            transaction fees.
          </p>
        </div>
      </div>

      {/* Results */}
      {stats.progress === 100 && !isProcessing && (
        <div className="card">
          <h3 className="text-lg font-heading font-bold mb-4">Payment Results</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-status-success/10 border border-status-success/30 rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Successful</p>
              <p className="text-3xl font-bold text-status-success">{stats.successful}</p>
            </div>
            <div className="bg-status-error/10 border border-status-error/30 rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Failed</p>
              <p className="text-3xl font-bold text-status-error">{stats.failed}</p>
            </div>
            <div className="bg-bitcoin/10 border border-bitcoin/30 rounded-lg p-4">
              <p className="text-sm text-text-secondary mb-1">Total Sent</p>
              <p className="text-2xl font-bold font-mono">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-text-muted">sats</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
