'use client';

import { useState } from 'react';
import { Calculator, Download, AlertCircle, CheckCircle, XCircle, Wallet, Users } from 'lucide-react';
import type { RankingPeriod } from '@/lib/cbaf/ranking-calculator';

interface MerchantFundingPanelProps {
  period: RankingPeriod;
}

export default function MerchantFundingPanel({ period }: MerchantFundingPanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [fundingData, setFundingData] = useState<any>(null);
  const [totalPool, setTotalPool] = useState('10000000');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [expandedEconomy, setExpandedEconomy] = useState<string | null>(null);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setMessage(null);
    setFundingData(null);

    try {
      const response = await fetch('/api/cbaf/funding/calculate-merchant-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: period.month,
          totalPool: parseInt(totalPool),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate funding');
      }

      setFundingData(data.merchantLevelDistribution);

      // Show warning if significant funds are unallocated
      const unallocatedPercent = parseFloat(data.merchantLevelDistribution.unallocatedPercentage);
      if (unallocatedPercent > 10) {
        setMessage({
          type: 'warning',
          text: `Warning: ${unallocatedPercent}% of funds cannot be distributed due to missing or unverified merchant addresses`,
        });
      } else {
        setMessage({
          type: 'success',
          text: `Calculated payments for ${data.merchantLevelDistribution.paymentRecords.length} merchants across ${data.merchantLevelDistribution.economyBreakdowns.length} economies`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Calculation failed',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExportCSV = () => {
    if (!fundingData || !fundingData.paymentRecords) return;

    // Generate CSV
    const headers = [
      'Lightning Address',
      'Amount (sats)',
      'Merchant Name',
      'Local Name',
      'Provider',
      'Economy',
      'Video Appearances',
      'Note'
    ];

    const rows = fundingData.paymentRecords.map((payment: any) => [
      payment.lightningAddress,
      payment.amountSats,
      payment.merchantName,
      payment.localName || '',
      payment.paymentProvider,
      payment.economyName,
      payment.videoAppearances,
      `CBAF ${period.monthName} ${period.year} - Merchant Payment`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbaf-merchant-payments-${period.month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="card">
        <h2 className="text-xl font-heading font-bold mb-4 text-gray-900">
          Merchant-Level Funding Distribution
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Calculate funding distribution to individual merchants based on verified Lightning addresses.
          Payments are distributed equally among verified merchants within each economy.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">Total Funding Pool (sats)</label>
            <input
              type="number"
              value={totalPool}
              onChange={(e) => setTotalPool(e.target.value)}
              className="input"
              disabled={isCalculating}
            />
            <p className="helper-text">
              ~${((parseInt(totalPool) / 100_000_000) * 35000).toLocaleString()} at $35k/BTC
            </p>
          </div>

          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="btn-primary w-full"
          >
            {isCalculating ? (
              <>Processing...</>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Calculate Merchant Payments
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg border ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
            message.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start gap-2">
              {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {message.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {message.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {fundingData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-green-50 border-green-200">
              <div className="text-sm text-green-600 mb-1">Distributed</div>
              <div className="text-2xl font-bold text-green-700">
                {(fundingData.totalDistributed / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-green-600">
                {fundingData.summary.merchantsWithVerifiedAddresses} merchants
              </div>
            </div>

            <div className="card bg-yellow-50 border-yellow-200">
              <div className="text-sm text-yellow-600 mb-1">Unallocated</div>
              <div className="text-2xl font-bold text-yellow-700">
                {(fundingData.totalUnallocated / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-yellow-600">
                {fundingData.unallocatedPercentage}% of pool
              </div>
            </div>

            <div className="card bg-red-50 border-red-200">
              <div className="text-sm text-red-600 mb-1">Unverified</div>
              <div className="text-2xl font-bold text-red-700">
                {fundingData.summary.merchantsWithUnverifiedAddresses}
              </div>
              <div className="text-xs text-red-600">merchants</div>
            </div>

            <div className="card bg-gray-50 border-gray-200">
              <div className="text-sm text-gray-600 mb-1">No Address</div>
              <div className="text-2xl font-bold text-gray-700">
                {fundingData.summary.merchantsWithoutAddresses}
              </div>
              <div className="text-xs text-gray-600">merchants</div>
            </div>
          </div>

          {/* Export Button */}
          {fundingData.paymentRecords.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export {fundingData.paymentRecords.length} Merchant Payments to CSV
            </button>
          )}

          {/* Economy Breakdowns */}
          <div className="card">
            <h3 className="text-lg font-heading font-bold mb-4 text-gray-900">
              Economy Breakdowns ({fundingData.economyBreakdowns.length})
            </h3>

            <div className="space-y-3">
              {fundingData.economyBreakdowns.map((economy: any) => (
                <div key={economy.economyId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedEconomy(expandedEconomy === economy.economyId ? null : economy.economyId)}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            #{economy.overallRank}
                          </span>
                          <span className="font-medium text-gray-900">
                            {economy.economyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600">
                            ✓ {economy.verifiedMerchants} verified
                          </span>
                          <span className="text-yellow-600">
                            ⚠ {economy.unverifiedMerchants} unverified
                          </span>
                          <span className="text-gray-600">
                            ∅ {economy.merchantsWithoutAddresses} no address
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {(economy.totalAllocation / 1_000).toFixed(0)}k sats
                        </div>
                        <div className="text-sm text-gray-500">
                          {economy.merchantPayments.length > 0 ? (
                            <span className="text-green-600">
                              {(economy.totalAllocation / economy.merchantPayments.length / 1_000).toFixed(0)}k each
                            </span>
                          ) : (
                            <span className="text-red-600">No payments</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {expandedEconomy === economy.economyId && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      {economy.merchantPayments.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No verified merchant addresses available for payment
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {economy.merchantPayments.map((payment: any) => (
                            <div key={payment.merchantId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {payment.localName || payment.merchantName}
                                </div>
                                <div className="text-xs text-gray-600 font-mono">
                                  {payment.lightningAddress}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {payment.paymentProvider} • {payment.videoAppearances} video{payment.videoAppearances !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">
                                  {(payment.amountSats / 1_000).toFixed(1)}k
                                </div>
                                <div className="text-xs text-gray-500">sats</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {economy.unallocatedAmount > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-yellow-700">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              Unallocated (missing/unverified addresses)
                            </span>
                            <span className="font-bold text-yellow-700">
                              {(economy.unallocatedAmount / 1_000).toFixed(0)}k sats
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
