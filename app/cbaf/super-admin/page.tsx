import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { videoSubmissions, economies, monthlyRankings, merchants } from '@/lib/db/schema';
import { desc, eq, count, sql } from 'drizzle-orm';
import { TrendingUp, Video, Building2, DollarSign, Users, CheckCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import FloatingNav from '@/components/ui/FloatingNav';
import RecentSubmissions from './RecentSubmissions';

export default async function SuperAdminDashboard() {
  const session = await requireAdmin();

  // Restrict to super_admin only
  if (session.user.role !== 'super_admin') {
    redirect('/cbaf/admin/reviews');
  }

  // Fetch statistics
  const [stats] = await db
    .select({
      totalVideos: count(videoSubmissions.id),
      approvedVideos: sql<number>`count(case when ${videoSubmissions.status} = 'approved' then 1 end)`,
      pendingVideos: sql<number>`count(case when ${videoSubmissions.status} = 'pending' then 1 end)`,
      totalEconomies: count(economies.id),
      totalMerchants: count(merchants.id),
    })
    .from(videoSubmissions)
    .leftJoin(economies, sql`true`)
    .leftJoin(merchants, sql`true`);

  // Get current month rankings count
  const currentMonth = new Date().toISOString().slice(0, 7);
  const rankingsCalculated = await db
    .select({ count: count() })
    .from(monthlyRankings)
    .where(eq(monthlyRankings.month, currentMonth));

  const hasCurrentMonthRankings = rankingsCalculated[0]?.count > 0;

  // Fetch recent video submissions
  const recentVideos = await db
    .select({
      id: videoSubmissions.id,
      videoTitle: videoSubmissions.videoTitle,
      status: videoSubmissions.status,
      submissionMonth: videoSubmissions.submissionMonth,
      submittedAt: videoSubmissions.submittedAt,
      reviewedAt: videoSubmissions.reviewedAt,
      economy: {
        id: economies.id,
        economyName: economies.economyName,
      },
    })
    .from(videoSubmissions)
    .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
    .orderBy(desc(videoSubmissions.submittedAt))
    .limit(20);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                {session.user.role === 'super_admin' ? 'Super Admin' : 'Admin'} Dashboard
              </h1>
              <p className="text-bitcoin-100 text-lg">
                Manage CBAF rankings, funding, and economies
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/cbaf/super-admin/funding"
                className="px-6 py-3 bg-white text-bitcoin-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
              >
                <DollarSign className="w-5 h-5 inline mr-2" />
                Funding Calculator
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Videos */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Videos</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalVideos}
            </div>
            <div className="text-sm text-gray-500">
              {stats.approvedVideos} approved, {stats.pendingVideos} pending
            </div>
          </div>

          {/* Economies */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Economies</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalEconomies}
            </div>
            <Link href="/cbaf/super-admin/economies" className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium">
              View all →
            </Link>
          </div>

          {/* Merchants */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Merchants</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalMerchants}
            </div>
            <div className="text-sm text-gray-500">Registered merchants</div>
          </div>

          {/* Rankings Status */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${hasCurrentMonthRankings ? 'bg-green-50' : 'bg-yellow-50'}`}>
                {hasCurrentMonthRankings ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-500">Current Month</span>
            </div>
            <div className={`text-lg font-bold mb-1 ${hasCurrentMonthRankings ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasCurrentMonthRankings ? 'Calculated' : 'Not Calculated'}
            </div>
            <Link href="/cbaf/super-admin/funding" className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium">
              {hasCurrentMonthRankings ? 'View rankings →' : 'Calculate now →'}
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/cbaf/super-admin/funding"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-bitcoin-300 hover:bg-bitcoin-50 transition-all group"
            >
              <div className="p-3 bg-bitcoin-100 rounded-xl group-hover:bg-bitcoin-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-bitcoin-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Calculate Rankings</h3>
                <p className="text-sm text-gray-500">Monthly economy rankings</p>
              </div>
            </Link>

            <Link
              href="/cbaf/super-admin/funding/allocate"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Allocate Funding</h3>
                <p className="text-sm text-gray-500">Distribute merchant payments</p>
              </div>
            </Link>

            <Link
              href="/cbaf/super-admin/rankings"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Rankings</h3>
                <p className="text-sm text-gray-500">Historical rankings data</p>
              </div>
            </Link>

            <Link
              href="/cbaf/super-admin/settings"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Configure wallet & API keys</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Submissions</h2>
            <Link
              href="/cbaf/admin/reviews"
              className="text-sm font-medium text-bitcoin-600 hover:text-bitcoin-700"
            >
              View all →
            </Link>
          </div>

          <RecentSubmissions videos={recentVideos} />
        </div>
      </main>
    </div>
  );
}
