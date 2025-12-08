import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { Video, Users, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch statistics
  const stats = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${videoSubmissions.status} = 'pending')::int`,
      approved: sql<number>`count(*) filter (where ${videoSubmissions.status} = 'approved')::int`,
      rejected: sql<number>`count(*) filter (where ${videoSubmissions.status} = 'rejected')::int`,
    })
    .from(videoSubmissions);

  const { total, pending, approved, rejected } = stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

  // Fetch total economies
  const economiesCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(economies);

  const totalEconomies = economiesCount[0]?.count || 0;

  // Fetch recent pending videos
  const recentPending = await db
    .select({
      video: videoSubmissions,
      economy: economies,
    })
    .from(videoSubmissions)
    .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
    .where(eq(videoSubmissions.status, 'pending'))
    .orderBy(desc(videoSubmissions.submittedAt))
    .limit(5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">CBAF Admin</h1>
              <p className="text-text-secondary mt-1">
                {session.user.role === 'super_admin' ? 'Super Admin' : 'Admin'} Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/cbaf/admin/reviews" className="btn-primary">
                <Video className="w-4 h-4 mr-2" />
                Review Queue ({pending})
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Videos */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total Videos</p>
                <p className="text-3xl font-bold mt-2">{total}</p>
              </div>
              <div className="w-12 h-12 bg-bitcoin/10 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-bitcoin" />
              </div>
            </div>
          </div>

          {/* Pending Review */}
          <div className="bg-bg-secondary border border-yellow-500/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2 text-yellow-500">{pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <Link href="/cbaf/admin/reviews?status=pending" className="text-xs text-yellow-500 hover:underline mt-3 inline-block">
              Review now ΓåÆ
            </Link>
          </div>

          {/* Approved */}
          <div className="bg-bg-secondary border border-green-500/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold mt-2 text-green-500">{approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">
              {total > 0 ? Math.round((approved / total) * 100) : 0}% approval rate
            </p>
          </div>

          {/* Rejected */}
          <div className="bg-bg-secondary border border-red-500/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold mt-2 text-red-500">{rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          {/* Total Economies */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Economies</p>
                <p className="text-3xl font-bold mt-2">{totalEconomies}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <Link href="/cbaf/admin/economies" className="text-xs text-purple-500 hover:underline mt-3 inline-block">
              View all ΓåÆ
            </Link>
          </div>
        </div>

        {/* Recent Pending Videos */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold">Recent Submissions</h2>
            <Link href="/cbaf/admin/reviews" className="text-sm text-bitcoin hover:underline">
              View all ΓåÆ
            </Link>
          </div>

          {recentPending.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-text-muted">All caught up! No pending reviews.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPending.map(({ video, economy }) => (
                <Link
                  key={video.id}
                  href={`/cbaf/admin/reviews/${video.id}`}
                  className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-bitcoin/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{video.videoTitle || 'Untitled Video'}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                      <span>{economy?.economyName || 'Unknown Economy'}</span>
                      <span>ΓÇó</span>
                      <span>{new Date(video.submittedAt).toLocaleDateString()}</span>
                      <span>ΓÇó</span>
                      <span>{video.merchantCount || 0} merchants</span>
                    </div>
                  </div>
                  <div className="text-yellow-500 font-medium text-sm">
                    Pending Review ΓåÆ
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/cbaf/admin/reviews"
            className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500 transition-colors group"
          >
            <Video className="w-8 h-8 text-yellow-500 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">Review Videos</h3>
            <p className="text-sm text-text-muted mb-4">
              Review pending video submissions and approve or reject them
            </p>
            <span className="text-sm text-yellow-500 group-hover:underline">
              Start reviewing ΓåÆ
            </span>
          </Link>

          <Link
            href="/cbaf/admin/economies"
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 transition-colors group"
          >
            <Users className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">Manage Economies</h3>
            <p className="text-sm text-text-muted mb-4">
              View and manage all Bitcoin circular economies
            </p>
            <span className="text-sm text-purple-500 group-hover:underline">
              View economies ΓåÆ
            </span>
          </Link>

          {session.user.role === 'super_admin' && (
            <Link
              href="/cbaf/super-admin/funding"
              className="bg-gradient-to-br from-bitcoin/20 to-bitcoin/5 border border-bitcoin/30 rounded-xl p-6 hover:border-bitcoin transition-colors group"
            >
              <TrendingUp className="w-8 h-8 text-bitcoin mb-3" />
              <h3 className="font-heading font-bold text-lg mb-2">Calculate Funding</h3>
              <p className="text-sm text-text-muted mb-4">
                Calculate monthly rankings and prepare bulk payments
              </p>
              <span className="text-sm text-bitcoin group-hover:underline">
                Manage funding ΓåÆ
              </span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
