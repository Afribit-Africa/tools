'use client';

import { useState } from 'react';
import { Calculator, Download, Save, AlertCircle } from 'lucide-react';
import type { RankingPeriod } from '@/lib/cbaf/ranking-calculator';

interface FundingAllocationPanelProps {
  period: RankingPeriod;
  existingDisbursements: any[];
}

export default function FundingAllocationPanel({
  period,
  existingDisbursements,
}: FundingAllocationPanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [fundingData, setFundingData] = useState<any>(null);
  const [totalPool, setTotalPool] = useState('10000000'); // 10M sats default
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasExisting = existingDisbursements.length > 0;

  const handleCalculate = async () => {
    setIsCalculating(true);
    setMessage(null);
    setFundingData(null);

    try {
      const response = await fetch('/api/cbaf/funding/calculate', {
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

      setFundingData(data);
      setMessage({
        type: 'success',
        text: `Calculated funding for ${data.allocations.length} economies`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Calculation failed',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!fundingData) return;

    if (
      !confirm(
        `Save funding disbursements for ${period.monthName} ${period.year}?\n\nThis will create ${fundingData.allocations.length} payment records totaling ${(fundingData.totalPool / 1_000_000).toFixed(2)}M sats.`
      )
    ) {
      return;
    }

    setIsCalculating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/cbaf/funding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: period.month,
          fundingData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save disbursements');
      }

      setMessage({
        type: 'success',
        text: 'Funding disbursements saved successfully!',
      });

      // Refresh page after success
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Save failed',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExportCSV = () => {
    if (!fundingData) return;

    const paymentRecords = fundingData.allocations.filter((a: any) => a.lightningAddress);

    if (paymentRecords.length === 0) {
      alert('No economies with Lightning addresses to export');
      return;
    }

    // Generate CSV content
    const headers = ['Lightning Address', 'Amount (sats)', 'Economy', 'Rank', 'Note'];
    const rows = paymentRecords.map((a: any) => [
      a.lightningAddress,
      a.totalFunding,
      a.economyName,
      a.overallRank,
      `CBAF ${period.monthName} ${period.year} - Rank #${a.overallRank}`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbaf-payments-${period.month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="card rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold mb-4">Funding Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Funding Pool (sats)
            </label>
            <input
              type="number"
              value={totalPool}
              onChange={(e) => setTotalPool(e.target.value)}
              disabled={hasExisting}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-50"
              placeholder="10000000"
            />
            <p className="text-xs text-gray-500 mt-1">
              ≈ ${((parseInt(totalPool) / 100_000_000) * 35000).toFixed(2)} @ $35k/BTC
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Period</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {period.monthName} {period.year}
            </div>
          </div>
        </div>

        {hasExisting && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-500">
              <p className="font-medium">Disbursements Already Exist</p>
              <p className="mt-1">
                Funding has already been calculated for this period. To recalculate, please delete
                existing disbursements first.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={isCalculating || hasExisting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Calculator className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Calculate Allocation'}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg border flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}
          >
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {fundingData && (
        <div className="card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold">Funding Allocation</h2>
              <p className="text-sm text-gray-500 mt-1">
                {fundingData.allocations.length} economies • {(fundingData.totalPool / 1_000_000).toFixed(2)}M sats total
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              {!hasExisting && (
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save to Database
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium">Rank</th>
                  <th className="text-left p-4 font-medium">Economy</th>
                  <th className="text-center p-4 font-medium">Metrics</th>
                  <th className="text-right p-4 font-medium">Base</th>
                  <th className="text-right p-4 font-medium">Rank Bonus</th>
                  <th className="text-right p-4 font-medium">Performance</th>
                  <th className="text-right p-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {fundingData.allocations.map((allocation: any) => (
                  <tr key={allocation.economyId} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <span className="font-bold">#{allocation.overallRank}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{allocation.economyName}</div>
                        {allocation.lightningAddress ? (
                          <div className="text-xs text-green-500">⚡ {allocation.lightningAddress}</div>
                        ) : (
                          <div className="text-xs text-yellow-500">⚠️ No Lightning address</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm">
                      <div>{allocation.videosApproved} videos</div>
                      <div className="text-gray-500">
                        {allocation.merchantsTotal} merchants ({allocation.merchantsNew} new)
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm">
                      {(allocation.baseAllocation / 1000).toFixed(0)}k
                    </td>
                    <td className="p-4 text-right text-sm">
                      {(allocation.rankBonus / 1000).toFixed(0)}k
                    </td>
                    <td className="p-4 text-right text-sm">
                      {(allocation.performanceBonus / 1000).toFixed(0)}k
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold">{(allocation.totalFunding / 1000).toFixed(0)}k</div>
                      <div className="text-xs text-gray-500">sats</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
