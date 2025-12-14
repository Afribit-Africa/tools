import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies, videoSubmissions, merchants, monthlyRankings } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { Video, TrendingUp, Users, Award, Calendar, ExternalLink, Trophy } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatCard, EmptyState, Badge } from '@/components/cbaf';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">{economy.economyName}</h1>
              <p className="text-gray-300 mt-1">
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
                className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
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
          <Link href="/cbaf/videos" className="block">
            <StatCard
              title="Total Submitted"
              value={totalSubmitted.toString()}
              icon={Video}
              iconBgColor="bg-bitcoin-100"
              iconColor="text-bitcoin-600"
            />
          </Link>

          {/* Videos Approved */}
          <StatCard
            title="Approved"
            value={totalApproved.toString()}
            icon={Award}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            trend={{
              value: `${approvalRate}%`,
              direction: 'up',
              label: 'approval rate'
            }}
          />

          {/* Merchants Registered */}
          <Link href="/cbaf/merchants" className="block">
            <StatCard
              title="Merchants"
              value={merchantCount.toString()}
              icon={Users}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </Link>

          {/* Current Rank */}
          <Link href="/cbaf/rankings" className="block">
            <StatCard
              title="Current Rank"
              value={ranking?.overallRank ? `#${ranking.overallRank}` : 'N/A'}
              icon={Trophy}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </Link>
        </div>

        {/* Recent Submissions */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-gray-900">Recent Submissions</h2>
            <Link href="/cbaf/videos" className="text-sm text-bitcoin-600 hover:text-bitcoin-700 hover:underline font-medium">
              View all →
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No video submissions yet"
              description="Get started by submitting your first proof-of-work video"
            >
              <Link href="/cbaf/videos/submit" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Video className="w-4 h-4" />
                Submit Your First Video
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-bitcoin-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {video.videoTitle || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                    <Badge
                      variant={
                        video.status === 'approved'
                          ? 'success'
                          : video.status === 'rejected'
                          ? 'error'
                          : video.status === 'pending'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {video.status}
                    </Badge>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bitcoin-600 hover:text-bitcoin-700 flex items-center gap-1"
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
          <Link
            href="/cbaf/videos/submit"
            className="bg-gradient-to-br from-bitcoin-50 to-white border-2 border-bitcoin-200 rounded-xl p-6 hover:border-bitcoin-400 hover:shadow-md transition-all group"
          >
            <Video className="w-8 h-8 text-bitcoin-600 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900">Submit Video</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Upload proof-of-work videos showcasing merchants in your circular economy
            </p>
            <span className="text-sm text-bitcoin-600 font-medium mt-4 inline-block group-hover:underline">
              Get started →
            </span>
          </Link>

          <Link
            href="/cbaf/merchants/register"
            className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900">Register Merchant</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Add new merchants from BTCMap to your circular economy network
            </p>
            <span className="text-sm text-purple-600 font-medium mt-4 inline-block group-hover:underline">
              Add merchant →
            </span>
          </Link>

          <Link
            href="/cbaf/rankings"
            className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-xl p-6 hover:border-orange-400 hover:shadow-md transition-all group"
          >
            <Trophy className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900">View Leaderboard</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              See how you rank against other circular economies
            </p>
            <span className="text-sm text-orange-600 font-medium mt-4 inline-block group-hover:underline">
              View rankings →
            </span>
          </Link>

          <Link
            href="/cbaf/merchants"
            className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6 hover:border-green-400 hover:shadow-md transition-all group"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track your progress and merchant network growth
            </p>
            <span className="text-sm text-green-600 font-medium mt-4 inline-block group-hover:underline">
              View stats →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
