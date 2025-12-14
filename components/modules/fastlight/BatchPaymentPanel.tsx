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
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1 text-white">No Payment Amounts Found</h4>
            <p className="text-sm text-gray-400">
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
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-heading font-bold mb-4 text-white">Batch Payment Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Recipients</p>
            <p className="text-2xl font-bold text-bitcoin-400">{validRecords.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Amount</p>
            <p className="text-2xl font-bold font-mono text-white">
              {totalAmount.toLocaleString()} sats
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Est. Fees</p>
            <p className="text-2xl font-bold font-mono text-green-400">
              ~0 sats
            </p>
            <p className="text-xs text-gray-500">Free for Blink users</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold font-mono text-white">
              {selectedWallet?.balance.toLocaleString()} sats
            </p>
          </div>
        </div>

        {/* Wallet Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium text-gray-300">Select Wallet</label>
          <select
            value={selectedWalletId}
            onChange={(e) => setSelectedWalletId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-bitcoin-500/50 focus:outline-none appearance-none"
            disabled={isProcessing}
          >
            {account.wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id} className="bg-gray-900">
                {wallet.walletCurrency} Wallet ({wallet.balance.toLocaleString()}{' '}
                {wallet.walletCurrency === 'BTC' ? 'sats' : 'cents'})
              </option>
            ))}
          </select>
        </div>

        {/* Balance Warning */}
        {selectedWallet && totalAmount > selectedWallet.balance && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">
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
          className="w-full px-6 py-3 bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="mt-4 bg-bitcoin-500/10 border border-bitcoin-500/20 rounded-lg p-3">
          <p className="text-xs text-gray-400">
            Payments will be sent sequentially with a small delay between each to ensure
            reliability. All payments to Blink addresses are <strong className="text-white">free</strong> with no
            transaction fees.
          </p>
        </div>
      </div>

      {/* Results */}
      {stats.progress === 100 && !isProcessing && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-heading font-bold mb-4 text-white">Payment Results</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Successful</p>
              <p className="text-3xl font-bold text-green-400">{stats.successful}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
            </div>
            <div className="bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Sent</p>
              <p className="text-2xl font-bold font-mono text-white">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">sats</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
