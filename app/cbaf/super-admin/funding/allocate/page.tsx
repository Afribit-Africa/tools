import { requireAdmin } from '@/lib/auth/session';
import { getAvailablePeriods, getCurrentPeriod } from '@/lib/cbaf/ranking-calculator';
import { getFundingDisbursements } from '@/lib/cbaf/funding-calculator';
import { DollarSign, Download, CheckCircle, Clock, XCircle, Zap, Wallet } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import FundingTabs from './FundingTabs';
import { StatCard, EmptyState, DashboardLayout, SuperAdminSidebarSections, PageHeader, Button } from '@/components/cbaf';

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
    <DashboardLayout
      sidebar={{
        sections: SuperAdminSidebarSections,
        userRole: 'super_admin'
      }}
    >
      <PageHeader
        title="Funding Allocation & Payments"
        description={`Allocate funds and export payment data for ${period.monthName} ${period.year}`}
        icon={DollarSign}
        breadcrumbs={[
          { label: 'Super Admin', href: '/cbaf/super-admin' },
          { label: 'Funding', href: '/cbaf/super-admin/funding' },
          { label: 'Allocate' }
        ]}
        actions={
          <Link href="/cbaf/super-admin/funding">
            <Button variant="secondary">← Back to Calculator</Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Period Selector */}
        {availablePeriods.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-2">Period:</label>
            <div className="flex flex-wrap gap-2">
              {availablePeriods.map((p) => (
                <Link
                  key={p.month}
                  href={`/cbaf/super-admin/funding/allocate?period=${p.month}`}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    params.period === p.month || (!params.period && p === availablePeriods[0])
                      ? 'bg-bitcoin-500 text-white border-bitcoin-500'
                      : 'bg-white/5 text-white border-white/10 hover:border-bitcoin-500/50'
                  }`}
                >
                  {p.monthName} {p.year}
                </Link>
              ))}
            </div>
          </div>
        )}
        {availablePeriods.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center backdrop-blur-xl">
            <DollarSign className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-white mb-2">No Rankings Available</h2>
            <p className="text-white/60 mb-6">
              You need to calculate rankings before allocating funding.
            </p>
            <Link href="/cbaf/super-admin/funding">
              <Button variant="primary">Go to Calculator</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics */}
            {hasExistingDisbursements && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60 text-sm">Total Amount</p>
                    <DollarSign className="w-5 h-5 text-bitcoin-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{(totalAmount / 1_000_000).toFixed(2)}M</p>
                  <p className="text-xs text-white/50 mt-1">sats</p>
                </div>

                <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60 text-sm">Completed</p>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
                  <p className="text-xs text-white/50 mt-1">payments</p>
                </div>

                <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60 text-sm">Pending</p>
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                  <p className="text-xs text-white/50 mt-1">payments</p>
                </div>

                <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-red-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60 text-sm">Failed</p>
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-red-400">{failedCount}</p>
                  <p className="text-xs text-white/50 mt-1">payments</p>
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
              <div className="mt-8 glass-card rounded-xl overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-heading font-bold text-white">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left p-4 font-medium text-white/70">Economy</th>
                        <th className="text-center p-4 font-medium text-white/70">Amount</th>
                        <th className="text-center p-4 font-medium text-white/70">Metrics</th>
                        <th className="text-center p-4 font-medium text-white/70">Status</th>
                        <th className="text-center p-4 font-medium text-white/70">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {existingDisbursements.map((disbursement) => (
                        <tr key={disbursement.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-medium text-white">{disbursement.economyName}</div>
                            <div className="text-xs text-white/50">
                              {disbursement.paymentMethod === 'lightning' ? '⚡ Lightning' : '📝 Manual'}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="font-bold text-white">{(disbursement.amountSats / 1000).toFixed(0)}k</div>
                            <div className="text-xs text-white/50">sats</div>
                          </td>
                          <td className="p-4 text-center text-sm">
                            <div className="text-white">{disbursement.videosApproved} videos</div>
                            <div className="text-white/60">
                              {disbursement.merchantsInvolved} merchants ({disbursement.newMerchants} new)
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {disbursement.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            )}
                            {disbursement.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full text-yellow-400 text-xs">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                            {disbursement.status === 'processing' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded-full text-blue-400 text-xs">
                                <Zap className="w-3 h-3" />
                                Processing
                              </span>
                            )}
                            {disbursement.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-full text-red-400 text-xs">
                                <XCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center text-sm text-white/50">
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
            <div className="mt-8 p-6 glass-card rounded-xl backdrop-blur-xl border-bitcoin-500/30">
              <h3 className="font-heading font-bold text-white mb-2">💡 Payment Process</h3>
              <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                <li><strong className="text-white">Calculate Allocation:</strong> Distributes funds based on rankings (base + rank bonus + performance)</li>
                <li><strong className="text-white">Export CSV:</strong> Download payment data for Fastlight bulk payment tool</li>
                <li><strong className="text-white">Import to Fastlight:</strong> Use the CSV with Fastlight to process Lightning payments</li>
                <li><strong className="text-white">Lightning Required:</strong> Only economies with Lightning addresses will receive automated payments</li>
                <li><strong className="text-white">Manual Payments:</strong> Economies without Lightning addresses require manual processing</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
