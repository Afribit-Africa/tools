import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies, videoSubmissions, merchants, monthlyRankings } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { Video, TrendingUp, Users, Award, Calendar, ExternalLink, Trophy } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await requireBCEProfile();
  const economyId = session.user.economyId!;

  // Fetch economy data with statistics
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, economyId),
  });

  if (!economy) {
    return <div>Economy not found</div>;
  }

  // Fetch current month's ranking
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">{economy.economyName}</h1>
              <p className="text-text-secondary mt-1">
                {economy.city ? `${economy.city}, ` : ''}{economy.country}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cbaf/videos/submit"
                className="btn-primary"
              >
                <Video className="w-4 h-4 mr-2" />
                Submit Video
              </Link>
              <Link
                href="/cbaf/merchants/register"
                className="btn-secondary"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Merchant
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Videos Submitted */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total Submitted</p>
                <p className="text-3xl font-bold mt-2">{totalSubmitted}</p>
              </div>
              <div className="w-12 h-12 bg-bitcoin/10 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-bitcoin" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">All-time video submissions</p>
          </div>

          {/* Videos Approved */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold mt-2 text-green-500">{totalApproved}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">{approvalRate}% approval rate</p>
          </div>

          {/* Merchants Registered */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Merchants</p>
                <p className="text-3xl font-bold mt-2">{merchantCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <Link href="/cbaf/merchants" className="text-xs text-bitcoin hover:underline mt-4 inline-block">
              View all merchants →
            </Link>
          </div>

          {/* Current Rank */}
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Current Rank</p>
                <p className="text-3xl font-bold mt-2">
                  {ranking?.overallRank ? `#${ranking.overallRank}` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <Link href="/cbaf/rankings" className="text-xs text-bitcoin hover:underline mt-4 inline-block">
              View leaderboard →
            </Link>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold">Recent Submissions</h2>
            <Link href="/cbaf/videos" className="text-sm text-bitcoin hover:underline">
              View all →
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted mb-4">No video submissions yet</p>
              <Link href="/cbaf/videos/submit" className="btn-primary inline-flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Submit Your First Video
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-primary hover:border-bitcoin/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {video.videoTitle || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        video.status === 'approved'
                          ? 'bg-green-500/10 text-green-500'
                          : video.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500'
                          : video.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {video.status}
                    </span>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bitcoin hover:underline flex items-center gap-1"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            href="/cbaf/videos/submit"
            className="bg-gradient-to-br from-bitcoin/20 to-bitcoin/5 border border-bitcoin/30 rounded-xl p-6 hover:border-bitcoin transition-colors group"
          >
            <Video className="w-8 h-8 text-bitcoin mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">Submit Video</h3>
            <p className="text-sm text-text-muted">
              Upload proof-of-work videos showcasing merchants in your circular economy
            </p>
            <span className="text-sm text-bitcoin mt-4 inline-block group-hover:underline">
              Get started →
            </span>
          </Link>

          <Link
            href="/cbaf/merchants/register"
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 transition-colors group"
          >
            <Users className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">Register Merchant</h3>
            <p className="text-sm text-text-muted">
              Add new merchants from BTCMap to your circular economy network
            </p>
            <span className="text-sm text-purple-500 mt-4 inline-block group-hover:underline">
              Add merchant →
            </span>
          </Link>

          <Link
            href="/cbaf/rankings"
            className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500 transition-colors group"
          >
            <Trophy className="w-8 h-8 text-orange-500 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">View Leaderboard</h3>
            <p className="text-sm text-text-muted">
              See how you rank against other circular economies
            </p>
            <span className="text-sm text-orange-500 mt-4 inline-block group-hover:underline">
              View rankings →
            </span>
          </Link>

          <Link
            href="/cbaf/merchants"
            className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-6 hover:border-green-500 transition-colors group"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">View Analytics</h3>
            <p className="text-sm text-text-muted">
              Track your progress and merchant network growth
            </p>
            <span className="text-sm text-green-500 mt-4 inline-block group-hover:underline">
              View stats →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
