import { requireAuth, getUserRole } from '@/lib/auth/session';
import { getSavedRankings, getCurrentPeriod, getAvailablePeriods } from '@/lib/cbaf/ranking-calculator';
import { Trophy, TrendingUp, Users, Video, Medal, Award, BarChart3, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import RankingsTable from './RankingsTable';
import FloatingNav from '@/components/ui/FloatingNav';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function RankingsPage({ searchParams }: PageProps) {
  await requireAuth();
  const role = await getUserRole();
  const params = await searchParams;

  // Get available periods
  const availablePeriods = await getAvailablePeriods();

  // Determine which period to show
  const requestedPeriod = params.period;
  let period = getCurrentPeriod();

  if (requestedPeriod) {
    const [year, month] = requestedPeriod.split('-').map(Number);
    period = { month: requestedPeriod, year, monthName: '' };
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    period.monthName = monthNames[month - 1];
  }

  // Get rankings for the period
  const rankings = await getSavedRankings(period);
  const hasRankings = rankings.length > 0;

  // Get top 3 for podium
  const topThree = rankings.slice(0, 3);

  // Calculate totals
  const totalVideos = rankings.reduce((sum, r) => sum + (r.videosApproved || 0), 0);
  const totalMerchants = rankings.reduce((sum, r) => sum + (r.merchantsTotal || 0), 0);
  const totalNewMerchants = rankings.reduce((sum, r) => sum + (r.merchantsNew || 0), 0);

  return (
    <div className="dark-page min-h-screen pb-20">
      {role && <FloatingNav role={role} />}

      {/* Header */}
      <header className="dark-header pt-28 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-white flex items-center gap-3 mb-2">
                <div className="p-2 bg-bitcoin-500/20 rounded-xl">
                  <Trophy className="w-8 h-8 text-bitcoin-400" />
                </div>
                CBAF Leaderboard
              </h1>
              <p className="text-white/60 text-lg">
                {period.monthName} {period.year} Rankings
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!hasRankings ? (
          <div className="glass-card text-center py-16">
            <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h2>
            <p className="text-white/50 max-w-md mx-auto">
              Rankings for {period.monthName} {period.year} haven&apos;t been calculated yet. 
              Rankings are calculated at the end of each month by administrators.
            </p>
          </div>
        ) : (
          <>
            {/* Period Selector */}
            {availablePeriods.length > 0 && (
              <div className="glass-card mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-bitcoin-400" />
                  <h3 className="font-bold text-white">Select Period</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/cbaf/rankings"
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      !params.period
                        ? 'bg-bitcoin-500 text-white'
                        : 'bg-white/5 border border-white/10 hover:border-bitcoin-500/50 text-white/70 hover:text-white'
                    }`}
                  >
                    Current Month
                  </Link>
                  {availablePeriods.map((p) => (
                    <Link
                      key={p.month}
                      href={`/cbaf/rankings?period=${p.month}`}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        params.period === p.month
                          ? 'bg-bitcoin-500 text-white'
                          : 'bg-white/5 border border-white/10 hover:border-bitcoin-500/50 text-white/70 hover:text-white'
                      }`}
                    >
                      {p.monthName} {p.year}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Total Videos</span>
                  <Video className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{totalVideos}</p>
                <p className="text-white/40 text-sm mt-1">approved this period</p>
              </div>

              <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Total Merchants</span>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">{totalMerchants}</p>
                <p className="text-white/40 text-sm mt-1">across all economies</p>
              </div>

              <div className="stat-card-dark-success">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400/70 text-sm">New Merchants</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-400">{totalNewMerchants}</p>
                <p className="text-green-400/50 text-sm mt-1">discovered this month</p>
              </div>
            </div>

            {/* Podium - Top 3 */}
            {topThree.length >= 3 && (
              <div className="glass-card mb-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-bitcoin-400" />
                  Top Performers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 2nd Place */}
                  <div className="order-2 md:order-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Medal className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-400 mb-1">#2</div>
                    <h3 className="text-lg font-semibold text-white mb-1">{topThree[1]?.economyName}</h3>
                    <p className="text-white/50 text-sm">{topThree[1]?.videosApproved} videos</p>
                  </div>

                  {/* 1st Place */}
                  <div className="order-1 md:order-2 bg-gradient-to-br from-bitcoin-500/20 to-orange-500/10 border border-bitcoin-500/30 rounded-2xl p-6 text-center transform md:scale-110">
                    <div className="w-20 h-20 bg-bitcoin-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-10 h-10 text-bitcoin-400" />
                    </div>
                    <div className="text-3xl font-bold text-bitcoin-400 mb-1">#1</div>
                    <h3 className="text-xl font-semibold text-white mb-1">{topThree[0]?.economyName}</h3>
                    <p className="text-white/60 text-sm">{topThree[0]?.videosApproved} videos</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="order-3 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-orange-700/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Medal className="w-8 h-8 text-orange-700" />
                    </div>
                    <div className="text-2xl font-bold text-orange-700 mb-1">#3</div>
                    <h3 className="text-lg font-semibold text-white mb-1">{topThree[2]?.economyName}</h3>
                    <p className="text-white/50 text-sm">{topThree[2]?.videosApproved} videos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="glass-card">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-bitcoin-400" />
                Complete Rankings
              </h2>
              <RankingsTable rankings={rankings} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
