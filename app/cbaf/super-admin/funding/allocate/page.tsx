import { requireAdmin } from '@/lib/auth/session';
import { getAvailablePeriods, getCurrentPeriod } from '@/lib/cbaf/ranking-calculator';
import { getFundingDisbursements } from '@/lib/cbaf/funding-calculator';
import { DollarSign, Download, CheckCircle, Clock, XCircle, Zap, Wallet } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import FundingTabs from './FundingTabs';
import { StatCard, EmptyState } from '@/components/cbaf';
import FloatingNav from '@/components/ui/FloatingNav';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function FundingAllocationPage({ searchParams }: PageProps) {
  const session = await requireAdmin();
  const params = await searchParams;

  // Restrict to super_admin only for payment operations
  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  const availablePeriods = await getAvailablePeriods();

  // Determine which period to show
  const requestedPeriod = params.period;
  let period = availablePeriods.length > 0 ? availablePeriods[0] : getCurrentPeriod();

  if (requestedPeriod) {
    const [year, month] = requestedPeriod.split('-').map(Number);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    period = { month: requestedPeriod, year, monthName: monthNames[month - 1] };
  }

  // Get existing disbursements
  const existingDisbursements = await getFundingDisbursements(period);
  const hasExistingDisbursements = existingDisbursements.length > 0;

  // Calculate stats from disbursements
  const totalAmount = existingDisbursements.reduce((sum, d) => sum + (d.amountSats || 0), 0);
  const completedCount = existingDisbursements.filter(d => d.status === 'completed').length;
  const pendingCount = existingDisbursements.filter(d => d.status === 'pending').length;
  const failedCount = existingDisbursements.filter(d => d.status === 'failed').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200 pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-bitcoin" />
                Funding Allocation & Payments
              </h1>
              <p className="text-gray-300 mt-1">
                Allocate funds and export payment data for {period.monthName} {period.year}
              </p>
            </div>
            <Link href="/cbaf/super-admin/funding" className="btn-secondary">
              ← Back to Calculator
            </Link>
          </div>

          {/* Period Selector */}
          {availablePeriods.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Period:</label>
              <div className="flex flex-wrap gap-2">
                {availablePeriods.map((p) => (
                  <Link
                    key={p.month}
                    href={`/cbaf/super-admin/funding/allocate?period=${p.month}`}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      params.period === p.month || (!params.period && p === availablePeriods[0])
                        ? 'bg-bitcoin text-white border-bitcoin'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-bitcoin/50'
                    }`}
                  >
                    {p.monthName} {p.year}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {availablePeriods.length === 0 ? (
          <div className="card rounded-xl p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">No Rankings Available</h2>
            <p className="text-gray-500 mb-6">
              You need to calculate rankings before allocating funding.
            </p>
            <Link href="/cbaf/super-admin/funding" className="btn-primary">
              Go to Calculator
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics */}
            {hasExistingDisbursements && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Total Amount</p>
                    <DollarSign className="w-5 h-5 text-bitcoin" />
                  </div>
                  <p className="text-2xl font-bold">{(totalAmount / 1_000_000).toFixed(2)}M</p>
                  <p className="text-xs text-gray-500 mt-1">sats</p>
                </div>

                <div className="bg-bg-secondary border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Completed</p>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-500">{completedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">payments</p>
                </div>

                <div className="bg-bg-secondary border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Pending</p>
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                  <p className="text-xs text-gray-500 mt-1">payments</p>
                </div>

                <div className="bg-bg-secondary border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">Failed</p>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-500">{failedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">payments</p>
                </div>
              </div>
            )}

            {/* Funding Allocation Tabs */}
            <FundingTabs
              period={period}
              existingDisbursements={existingDisbursements}
            />

            {/* Existing Disbursements */}
            {hasExistingDisbursements && (
              <div className="mt-8 card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border-primary">
                  <h2 className="text-xl font-heading font-bold">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-bg-primary border-b border-border-primary">
                      <tr>
                        <th className="text-left p-4 font-medium">Economy</th>
                        <th className="text-center p-4 font-medium">Amount</th>
                        <th className="text-center p-4 font-medium">Metrics</th>
                        <th className="text-center p-4 font-medium">Status</th>
                        <th className="text-center p-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary">
                      {existingDisbursements.map((disbursement) => (
                        <tr key={disbursement.id} className="hover:bg-bg-primary/50">
                          <td className="p-4">
                            <div className="font-medium">{disbursement.economyName}</div>
                            <div className="text-xs text-gray-500">
                              {disbursement.paymentMethod === 'lightning' ? '⚡ Lightning' : '📝 Manual'}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="font-bold">{(disbursement.amountSats / 1000).toFixed(0)}k</div>
                            <div className="text-xs text-gray-500">sats</div>
                          </td>
                          <td className="p-4 text-center text-sm">
                            <div>{disbursement.videosApproved} videos</div>
                            <div className="text-gray-500">
                              {disbursement.merchantsInvolved} merchants ({disbursement.newMerchants} new)
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {disbursement.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full text-green-500 text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            )}
                            {disbursement.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full text-yellow-500 text-xs">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                            {disbursement.status === 'processing' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded-full text-blue-500 text-xs">
                                <Zap className="w-3 h-3" />
                                Processing
                              </span>
                            )}
                            {disbursement.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-full text-red-500 text-xs">
                                <XCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center text-sm text-gray-500">
                            {new Date(disbursement.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-8 p-6 bg-bitcoin/10 border border-bitcoin/30 rounded-xl">
              <h3 className="font-heading font-bold mb-2">💡 Payment Process</h3>
              <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                <li><strong>Calculate Allocation:</strong> Distributes funds based on rankings (base + rank bonus + performance)</li>
                <li><strong>Export CSV:</strong> Download payment data for Fastlight bulk payment tool</li>
                <li><strong>Import to Fastlight:</strong> Use the CSV with Fastlight to process Lightning payments</li>
                <li><strong>Lightning Required:</strong> Only economies with Lightning addresses will receive automated payments</li>
                <li><strong>Manual Payments:</strong> Economies without Lightning addresses require manual processing</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
