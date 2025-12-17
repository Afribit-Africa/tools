import { requireAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { videoSubmissions, economies, monthlyRankings, merchants } from '@/lib/db/schema';
import { desc, eq, count, sql } from 'drizzle-orm';
import { TrendingUp, Video, Building2, DollarSign, Users, CheckCircle, Settings, Send, BarChart3, ArrowRight, Shield, Home } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout, SuperAdminSidebarSections, PageHeader, Button } from '@/components/cbaf';
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
    <DashboardLayout
      sidebar={{
        sections: SuperAdminSidebarSections,
        userRole: 'super_admin',
      }}
    >
      <PageHeader
        title="Super Admin Dashboard"
        description="Manage CBAF rankings, funding, and economies"
        icon={Shield}
        breadcrumbs={[
          { label: 'Dashboard' },
        ]}
        actions={
          <Link href="/cbaf/super-admin/funding/bulk-payment">
            <Button variant="primary" icon={Send} darkMode={true}>
              Bulk Payment
            </Button>
          </Link>
        }
      />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Videos */}
        <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Total Videos</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalVideos}</div>
          <div className="text-sm text-white/50">
            {stats.approvedVideos} approved, {stats.pendingVideos} pending
          </div>
        </div>

        {/* Economies */}
        <div className="glass-card rounded-xl p-6 backdrop-blur-xl border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-emerald-400/70">Economies</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.totalEconomies}</div>
          <Link href="/cbaf/super-admin/economies" className="text-sm text-emerald-400/80 hover:text-emerald-400 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Merchants */}
        <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Merchants</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalMerchants}</div>
          <div className="text-sm text-white/50">Registered merchants</div>
        </div>

        {/* Rankings Status */}
        <div className={`glass-card rounded-xl p-6 backdrop-blur-xl ${hasCurrentMonthRankings ? 'border-emerald-500/30' : 'border-yellow-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${hasCurrentMonthRankings ? 'bg-emerald-500/20' : 'bg-yellow-500/20'}`}>
              {hasCurrentMonthRankings ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              )}
            </div>
            <span className={`text-sm font-medium ${hasCurrentMonthRankings ? 'text-emerald-400/70' : 'text-yellow-400/70'}`}>
              Current Month
            </span>
          </div>
          <div className={`text-lg font-bold mb-1 ${hasCurrentMonthRankings ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {hasCurrentMonthRankings ? 'Calculated' : 'Not Calculated'}
          </div>
          <Link 
            href="/cbaf/super-admin/funding" 
            className={`text-sm font-medium flex items-center gap-1 ${hasCurrentMonthRankings ? 'text-emerald-400/80 hover:text-emerald-400' : 'text-yellow-400/80 hover:text-yellow-400'}`}
          >
            {hasCurrentMonthRankings ? 'View rankings' : 'Calculate now'} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-6 mb-8 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/cbaf/super-admin/funding"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-bitcoin-500/50 hover:bg-bitcoin-500/10 transition-all group"
          >
            <div className="p-3 bg-bitcoin-500/20 rounded-xl group-hover:bg-bitcoin-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-bitcoin-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Calculate Rankings</h3>
              <p className="text-sm text-white/50">Monthly economy rankings</p>
            </div>
          </Link>

          <Link
            href="/cbaf/super-admin/funding/bulk-payment"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group"
          >
            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
              <Send className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Bulk Payment</h3>
              <p className="text-sm text-white/50">Send batch payments</p>
            </div>
          </Link>

          <Link
            href="/cbaf/rankings"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
          >
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">View Leaderboard</h3>
              <p className="text-sm text-white/50">Economy rankings</p>
            </div>
          </Link>

          <Link
            href="/cbaf/super-admin/settings"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group"
          >
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Settings</h3>
              <p className="text-sm text-white/50">Configure wallet & API</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Submissions</h2>
          <Link href="/cbaf/admin/reviews" className="text-sm font-medium text-bitcoin-400 hover:text-bitcoin-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <RecentSubmissions videos={recentVideos} />
      </div>
    </DashboardLayout>
  );
}
