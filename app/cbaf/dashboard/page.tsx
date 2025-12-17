import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies, videoSubmissions, merchants, monthlyRankings } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { Video, TrendingUp, Users, Award, Calendar, ExternalLink, Trophy, ArrowRight, Zap, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardLayout, BCESidebarSections, PageHeader, Button } from '@/components/cbaf';

export default async function DashboardPage() {
  const session = await requireBCEProfile();

  // Redirect admins to their dashboard
  if (session.user.role === 'admin' || session.user.role === 'super_admin') {
    redirect('/cbaf/admin');
  }

  // If no economyId, redirect to setup (safety check)
  if (!session.user.economyId) {
    redirect('/cbaf/setup');
  }

  const economyId = session.user.economyId;

  // Fetch economy data with statistics
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, economyId),
  });

  if (!economy) {
    return <div className="dark-page flex items-center justify-center">Economy not found</div>;
  }

  // Fetch current month's ranking
  const currentMonth = new Date().toISOString().slice(0, 7);
  const ranking = await db.query.monthlyRankings.findFirst({
    where: and(
      eq(monthlyRankings.economyId, economyId),
      eq(monthlyRankings.month, currentMonth)
    ),
  });

  // Fetch recent video submissions
  const recentVideos = await db.query.videoSubmissions.findMany({
    where: eq(videoSubmissions.economyId, economyId),
    orderBy: [desc(videoSubmissions.submittedAt)],
    limit: 5,
  });

  // Fetch registered merchants count
  const merchantsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(merchants)
    .where(eq(merchants.economyId, economyId));

  const merchantCount = merchantsResult[0]?.count || 0;

  // Calculate statistics
  const totalSubmitted = economy.totalVideosSubmitted || 0;
  const totalApproved = economy.totalVideosApproved || 0;
  const approvalRate = totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0;

  return (
    <DashboardLayout
      sidebar={{
        sections: BCESidebarSections,
        userRole: 'bce',
        economyName: economy.economyName,
      }}
    >
      <PageHeader
        title={economy.economyName}
        description={`${economy.city ? `${economy.city}, ` : ''}${economy.country}`}
        icon={Home}
        breadcrumbs={[
          { label: 'CBAF', href: '/cbaf/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <>
            <Link href="/cbaf/videos/submit">
              <Button variant="primary" icon={Plus}>
                Submit Video
              </Button>
            </Link>
            <Link href="/cbaf/merchants/register">
              <Button variant="secondary" icon={Users}>
                Add Merchant
              </Button>
            </Link>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Videos Submitted */}
          <Link href="/cbaf/videos" className="block">
            <div className="glass-card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-bitcoin-500/20 rounded-xl">
                  <Video className="w-6 h-6 text-bitcoin-400" />
                </div>
                <span className="text-sm font-medium text-white/50">Total Submitted</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalSubmitted}</div>
            </div>
          </Link>

          {/* Videos Approved */}
          <div className="stat-card-dark-success">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-400/70">Approved</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{totalApproved}</div>
            <div className="text-sm text-green-400/60 mt-1">{approvalRate}% approval rate</div>
          </div>

          {/* Merchants Registered */}
          <Link href="/cbaf/merchants" className="block">
            <div className="glass-card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white/50">Merchants</span>
              </div>
              <div className="text-3xl font-bold text-white">{merchantCount}</div>
            </div>
          </Link>

          {/* Current Rank */}
          <Link href="/cbaf/rankings" className="block">
            <div className="stat-card-dark-bitcoin">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-bitcoin-500/20 rounded-xl">
                  <Trophy className="w-6 h-6 text-bitcoin-400" />
                </div>
                <span className="text-sm font-medium text-bitcoin-400/70">Current Rank</span>
              </div>
              <div className="text-3xl font-bold text-bitcoin-400">
                {ranking?.overallRank ? `#${ranking.overallRank}` : 'N/A'}
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Submissions */}
        <div className="glass-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-white">Recent Submissions</h2>
            <Link href="/cbaf/videos" className="text-sm text-bitcoin-400 hover:text-bitcoin-300 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No video submissions yet</h3>
              <p className="text-white/50 mb-4">Get started by submitting your first proof-of-work video</p>
              <Link href="/cbaf/videos/submit" className="btn-primary-dark inline-flex items-center gap-2">
                <Video className="w-4 h-4" />
                Submit Your First Video
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {video.videoTitle || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(video.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {video.merchantCount || 0} merchants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {video.status === 'approved' && <span className="badge-success-dark">Approved</span>}
                    {video.status === 'rejected' && <span className="badge-error-dark">Rejected</span>}
                    {video.status === 'pending' && <span className="badge-warning-dark">Pending</span>}
                    {video.status === 'flagged' && <span className="badge-info-dark">Flagged</span>}
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-white/50 hover:text-bitcoin-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/cbaf/videos/submit" className="gradient-card group hover:border-bitcoin-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-bitcoin-500/10 via-transparent to-orange-500/5 pointer-events-none" />
            <div className="relative p-6">
              <Video className="w-8 h-8 text-bitcoin-400 mb-3" />
              <h3 className="font-heading font-bold text-lg mb-2 text-white">Submit Video</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Upload proof-of-work videos showcasing merchants
              </p>
              <span className="text-sm text-bitcoin-400 font-medium mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/cbaf/merchants/register" className="gradient-card group hover:border-purple-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="relative p-6">
              <Users className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-heading font-bold text-lg mb-2 text-white">Register Merchant</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Add new merchants from BTCMap to your network
              </p>
              <span className="text-sm text-purple-400 font-medium mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Add merchant <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/cbaf/rankings" className="gradient-card group hover:border-orange-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/5 pointer-events-none" />
            <div className="relative p-6">
              <Trophy className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="font-heading font-bold text-lg mb-2 text-white">View Leaderboard</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                See how you rank against other economies
              </p>
              <span className="text-sm text-orange-400 font-medium mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View rankings <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <Link href="/cbaf/merchants" className="gradient-card group hover:border-green-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 pointer-events-none" />
            <div className="relative p-6">
              <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="font-heading font-bold text-lg mb-2 text-white">View Analytics</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Track your progress and merchant growth
              </p>
              <span className="text-sm text-green-400 font-medium mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View stats <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </main>
    </DashboardLayout>
  );
}
