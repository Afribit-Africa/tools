import { requireAuth } from '@/lib/auth/session';
import { getSavedRankings, getCurrentPeriod, getAvailablePeriods } from '@/lib/cbaf/ranking-calculator';
import { Trophy, TrendingUp, Users, Video, Medal, Award } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: { period?: string };
}

export default async function RankingsPage({ searchParams }: PageProps) {
  await requireAuth();

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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
                <Trophy className="w-8 h-8 text-bitcoin" />
                CBAF Leaderboard
              </h1>
              <p className="text-text-secondary mt-1">
                {period.monthName} {period.year} Rankings
              </p>
            </div>
            <Link href="/cbaf/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Period Selector */}
          {availablePeriods.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">View Rankings For:</label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/cbaf/rankings"
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    !searchParams.period
                      ? 'bg-bitcoin text-white border-bitcoin'
                      : 'bg-bg-primary border-border-primary hover:border-bitcoin/50'
                  }`}
                >
                  Current Month
                </Link>
                {availablePeriods.map((p) => (
                  <Link
                    key={p.month}
                    href={`/cbaf/rankings?period=${p.month}`}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      searchParams.period === p.month
                        ? 'bg-bitcoin text-white border-bitcoin'
                        : 'bg-bg-primary border-border-primary hover:border-bitcoin/50'
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
        {!hasRankings ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">No Rankings Yet</h2>
            <p className="text-text-muted mb-6">
              Rankings for {period.monthName} {period.year} haven't been calculated yet.
            </p>
            <p className="text-sm text-text-muted">
              Rankings are calculated at the end of each month by administrators.
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div className="mb-12">
                <h2 className="text-2xl font-heading font-bold mb-6 text-center">
                  🏆 Top Performers
                </h2>
                <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto items-end">
                  {/* 2nd Place */}
                  {topThree[1] && (
                    <div className="bg-gradient-to-br from-gray-400/20 to-gray-400/5 border-2 border-gray-400 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Medal className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-4xl font-bold mb-2">2</div>
                      <h3 className="font-heading font-bold text-lg mb-2">{topThree[1].economyName}</h3>
                      <div className="space-y-1 text-sm">
                        <p>{topThree[1].videosApproved} videos</p>
                        <p>{topThree[1].merchantsTotal} merchants</p>
                        <p className="text-green-500">{topThree[1].merchantsNew} new</p>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <div className="bg-gradient-to-br from-bitcoin/20 to-bitcoin/5 border-2 border-bitcoin rounded-xl p-6 text-center transform scale-110">
                      <div className="w-20 h-20 bg-bitcoin rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-5xl font-bold mb-2 text-bitcoin">1</div>
                      <h3 className="font-heading font-bold text-xl mb-2">{topThree[0].economyName}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold">{topThree[0].videosApproved} videos</p>
                        <p className="font-bold">{topThree[0].merchantsTotal} merchants</p>
                        <p className="text-green-500 font-bold">{topThree[0].merchantsNew} new</p>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <div className="bg-gradient-to-br from-amber-700/20 to-amber-700/5 border-2 border-amber-700 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-4xl font-bold mb-2">3</div>
                      <h3 className="font-heading font-bold text-lg mb-2">{topThree[2].economyName}</h3>
                      <div className="space-y-1 text-sm">
                        <p>{topThree[2].videosApproved} videos</p>
                        <p>{topThree[2].merchantsTotal} merchants</p>
                        <p className="text-green-500">{topThree[2].merchantsNew} new</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-primary border-b border-border-primary">
                    <tr>
                      <th className="text-left p-4 font-medium">Rank</th>
                      <th className="text-left p-4 font-medium">Economy</th>
                      <th className="text-center p-4 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Video className="w-4 h-4" />
                          Videos
                        </div>
                      </th>
                      <th className="text-center p-4 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-4 h-4" />
                          Merchants
                        </div>
                      </th>
                      <th className="text-center p-4 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          New
                        </div>
                      </th>
                      <th className="text-center p-4 font-medium">Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {rankings.map((ranking) => (
                      <tr
                        key={ranking.economyId}
                        className={`hover:bg-bg-primary/50 ${
                          ranking.overallRank <= 3 ? 'bg-bitcoin/5' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {ranking.overallRank === 1 && <Trophy className="w-5 h-5 text-bitcoin" />}
                            {ranking.overallRank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                            {ranking.overallRank === 3 && <Award className="w-5 h-5 text-amber-700" />}
                            <span className="font-bold text-lg">#{ranking.overallRank}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{ranking.economyName}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div>
                            <div className="font-bold">{ranking.videosApproved}</div>
                            <div className="text-xs text-text-muted">
                              (#{ranking.rankByVideos})
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div>
                            <div className="font-bold">{ranking.merchantsTotal}</div>
                            <div className="text-xs text-text-muted">
                              (#{ranking.rankByMerchants})
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div>
                            <div className="font-bold text-green-500">{ranking.merchantsNew}</div>
                            <div className="text-xs text-text-muted">
                              (#{ranking.rankByNewMerchants})
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-sm">
                            {ranking.approvalRate.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-bitcoin/10 border border-bitcoin/30 rounded-xl">
              <h3 className="font-heading font-bold mb-2">📊 How Rankings Work</h3>
              <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
                <li><strong>Overall Rank:</strong> Weighted combination of all metrics (40% videos, 30% merchants, 30% new discoveries)</li>
                <li><strong>Video Score:</strong> Approved videos weighted by approval rate</li>
                <li><strong>Merchant Score:</strong> Total unique merchants featured in approved videos</li>
                <li><strong>New Discovery Bonus:</strong> First-time merchants are weighted 2x to encourage exploration</li>
                <li><strong>Rankings by Category:</strong> See individual rankings for videos, merchants, and new discoveries</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
