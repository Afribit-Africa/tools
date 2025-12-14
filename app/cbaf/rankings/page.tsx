import { requireAuth, getUserRole } from '@/lib/auth/session';
import { getSavedRankings, getCurrentPeriod, getAvailablePeriods } from '@/lib/cbaf/ranking-calculator';
import { Trophy, TrendingUp, Users, Video, Medal, Award, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/cbaf';
import RankingsTable from './RankingsTable';
import CustomDropdown from '@/components/ui/CustomDropdown';
import FloatingNav from '@/components/ui/FloatingNav';

interface PageProps {
  searchParams: { period?: string };
}

export default async function RankingsPage({ searchParams }: PageProps) {
  await requireAuth();
  const role = await getUserRole();

  // Get available periods
  const availablePeriods = await getAvailablePeriods();

  // Determine which period to show
  const requestedPeriod = searchParams.period;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {role && <FloatingNav role={role} />}

      {/* Hero Header */}
      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-xl pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Trophy className="w-8 h-8" />
                </div>
                CBAF Leaderboard
              </h1>
              <p className="text-bitcoin-50 text-lg">
                {period.monthName} {period.year} Rankings
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {!hasRankings ? (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12">
            <EmptyState
              icon={Trophy}
              title="No Rankings Yet"
              description={`Rankings for ${period.monthName} ${period.year} haven't been calculated yet. Rankings are calculated at the end of each month by administrators.`}
            />
          </div>
        ) : (
          <>
            {/* Period Selector Card */}
            {availablePeriods.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-bitcoin-600" />
                  <h3 className="font-bold text-gray-900">Select Period</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/cbaf/rankings"
                    className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                      !searchParams.period
                        ? 'bg-bitcoin-500 text-white border-bitcoin-500 shadow-lg'
                        : 'bg-white border-gray-200 hover:border-bitcoin-300 hover:bg-bitcoin-50 text-gray-700'
                    }`}
                  >
                    Current Month
                  </Link>
                  {availablePeriods.map((p) => (
                    <Link
                      key={p.month}
                      href={`/cbaf/rankings?period=${p.month}`}
                      className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                        searchParams.period === p.month
                          ? 'bg-bitcoin-500 text-white border-bitcoin-500 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-bitcoin-300 hover:bg-bitcoin-50 text-gray-700'
                      }`}
                    >
                      {p.monthName} {p.year}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div className="mb-10">
                <h2 className="text-3xl font-heading font-bold mb-8 text-center text-gray-900">
                  🏆 Top Performers
                </h2>
                <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="bg-gradient-to-br from-gray-200 to-white border-2 border-gray-400 rounded-2xl p-6 text-center shadow-xl transform transition-transform hover:scale-105">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Medal className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-5xl font-bold mb-2 text-gray-700">2</div>
                      <h3 className="font-heading font-bold text-xl mb-3 text-gray-900">{topThree[1].economyName}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-600">Videos</span>
                          <span className="font-bold text-gray-900">{topThree[1].videosApproved}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-600">Merchants</span>
                          <span className="font-bold text-gray-900">{topThree[1].merchantsTotal}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm text-green-700">New</span>
                          <span className="font-bold text-green-600">{topThree[1].merchantsNew}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="bg-gradient-to-br from-bitcoin-100 to-orange-50 border-4 border-bitcoin-500 rounded-2xl p-8 text-center transform scale-110 shadow-2xl">
                      <div className="w-24 h-24 bg-gradient-to-br from-bitcoin-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Trophy className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-6xl font-bold mb-3 text-bitcoin-600">1</div>
                      <h3 className="font-heading font-bold text-2xl mb-4 text-gray-900">{topThree[0].economyName}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border-2 border-bitcoin-200 shadow-sm">
                          <span className="text-sm text-gray-600 font-semibold">Videos</span>
                          <span className="font-bold text-gray-900 text-lg">{topThree[0].videosApproved}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border-2 border-bitcoin-200 shadow-sm">
                          <span className="text-sm text-gray-600 font-semibold">Merchants</span>
                          <span className="font-bold text-gray-900 text-lg">{topThree[0].merchantsTotal}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-lg border-2 border-green-300 shadow-sm">
                          <span className="text-sm text-green-700 font-semibold">New</span>
                          <span className="font-bold text-green-600 text-lg">{topThree[0].merchantsNew}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="bg-gradient-to-br from-amber-200 to-amber-50 border-2 border-amber-700 rounded-2xl p-6 text-center shadow-xl transform transition-transform hover:scale-105">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-5xl font-bold mb-2 text-amber-800">3</div>
                      <h3 className="font-heading font-bold text-xl mb-3 text-gray-900">{topThree[2].economyName}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-amber-300">
                          <span className="text-sm text-gray-600">Videos</span>
                          <span className="font-bold text-gray-900">{topThree[2].videosApproved}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-amber-300">
                          <span className="text-sm text-gray-600">Merchants</span>
                          <span className="font-bold text-gray-900">{topThree[2].merchantsTotal}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm text-green-700">New</span>
                          <span className="font-bold text-green-600">{topThree[2].merchantsNew}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Rankings Table with Pagination */}
            <RankingsTable rankings={rankings} />

            {/* Info Box */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <h3 className="font-heading font-bold mb-4 text-gray-900 flex items-center gap-2 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                How Rankings Work
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Overall Rank</h4>
                    <p className="text-sm text-gray-600">Weighted combination: 40% videos, 30% merchants, 30% new discoveries</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Video Score</h4>
                    <p className="text-sm text-gray-600">Approved videos weighted by approval rate for quality</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Merchant Score</h4>
                    <p className="text-sm text-gray-600">Total unique merchants featured in approved videos</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Discovery Bonus</h4>
                    <p className="text-sm text-gray-600">First-time merchants weighted 2x to encourage exploration</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
