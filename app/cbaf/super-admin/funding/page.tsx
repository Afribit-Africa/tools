import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAvailablePeriods, getCurrentPeriod } from '@/lib/cbaf/ranking-calculator';
import { 
  Calculator, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Send,
  Clock,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import CalculateRankingsButton from './CalculateRankingsButton';
import CustomPeriodCalculator from './CustomPeriodCalculator';
import { DashboardLayout, SuperAdminSidebarSections, PageHeader } from '@/components/cbaf';

export default async function FundingPage() {
  const session = await requireAdmin();

  // Restrict to super_admin only
  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  const currentPeriod = getCurrentPeriod();
  const availablePeriods = await getAvailablePeriods();
  const currentMonthCalculated = availablePeriods.some(p => p.month === currentPeriod.month);

  return (
    <DashboardLayout
      sidebar={{
        sections: SuperAdminSidebarSections,
        userRole: 'super_admin'
      }}
    >
      <PageHeader
        title="Funding & Rankings"
        description="Calculate rankings and manage economy funding"
        icon={Calculator}
        breadcrumbs={[
          { label: 'Super Admin', href: '/cbaf/super-admin' },
          { label: 'Funding' }
        ]}
      />

      <div className="max-w-7xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Bulk Payment Card */}
          <Link
            href="/cbaf/super-admin/funding/bulk-payment"
            className="glass-card rounded-xl p-6 backdrop-blur-xl group hover:border-bitcoin-500/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-bitcoin-500/10 via-transparent to-bitcoin-500/5 pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-bitcoin-500/20 rounded-xl border border-bitcoin-500/30">
                  <Send className="w-8 h-8 text-bitcoin-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-bitcoin-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Bulk Payment</h2>
              <p className="text-white/60 mb-4">
                Send batch payments to all economies via Lightning. Includes address verification and amount allocation.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Zap className="w-4 h-4 text-bitcoin-400" />
                  Lightning Fast
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Users className="w-4 h-4 text-emerald-400" />
                  All Economies
                </div>
              </div>
            </div>
          </Link>

          {/* View Rankings Card */}
          <Link
            href="/cbaf/rankings"
            className="glass-card rounded-xl p-6 backdrop-blur-xl group hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">View Leaderboard</h2>
              <p className="text-white/60 mb-4">
                See economy rankings, merchant counts, and activity metrics. Rankings are for information only.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Real-time Stats
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Monthly Periods
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Current Month Rankings */}
        <section className="mb-8">
          <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Calendar className="w-6 h-6 text-bitcoin-400" />
                  <h2 className="text-2xl font-heading font-bold text-white">
                    {currentPeriod.monthName} {currentPeriod.year}
                  </h2>
                </div>
                <p className="text-white/60 text-sm">Current ranking period</p>
              </div>
              {currentMonthCalculated ? (
                <div className="badge-success-dark flex items-center gap-2 px-4 py-2">
                  <CheckCircle className="w-4 h-4" />
                  Calculated
                </div>
              ) : (
                <div className="badge-warning-dark flex items-center gap-2 px-4 py-2">
                  <Clock className="w-4 h-4" />
                  Pending
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                How Rankings Work
              </h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• Analyzes all approved videos for the month</li>
                <li>• Calculates metrics: videos, merchants, new discoveries</li>
                <li>• Rankings are <strong className="text-white">information only</strong> - funding is separate</li>
              </ul>
            </div>

            {/* Calculate Button */}
            <CalculateRankingsButton
              year={currentPeriod.year}
              month={parseInt(currentPeriod.month.split('-')[1])}
              label={`Calculate ${currentPeriod.monthName} ${currentPeriod.year}`}
              isCurrentMonth={true}
            />

            {/* Quick Links */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
              <span className="text-sm text-white/50">View results after calculation</span>
              <Link
                href="/cbaf/rankings"
                className="btn-secondary-dark text-sm"
              >
                View Leaderboard →
              </Link>
            </div>
          </div>
        </section>

        {/* Previously Calculated Periods */}
        {availablePeriods.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Previously Calculated
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePeriods.map((period) => (
                <div
                  key={period.month}
                  className="glass-card-hover rounded-xl p-6 backdrop-blur-xl group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white group-hover:text-bitcoin-400 transition-colors">
                        {period.monthName} {period.year}
                      </h3>
                      <p className="text-xs text-white/50">Rankings available</p>
                    </div>
                    <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/cbaf/rankings?period=${period.month}`}
                      className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                    >
                      View Rankings
                    </Link>
                    <CalculateRankingsButton
                      year={period.year}
                      month={parseInt(period.month.split('-')[1])}
                      label="Recalculate"
                      isCurrentMonth={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Period Calculator */}
        <section>
          <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-bitcoin-400" />
              Calculate Custom Period
            </h2>
            <p className="text-white/60 text-sm mb-6">
              Calculate rankings for any past month (historical data or corrections)
            </p>
            <CustomPeriodCalculator currentYear={currentPeriod.year} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
