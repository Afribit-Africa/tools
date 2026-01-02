import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies, merchants, videoSubmissions, monthlyRankings } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import {
  Globe, MapPin, Video, Users, TrendingUp, ExternalLink,
  Twitter, Mail, Phone, Calendar, Award, CheckCircle,
  XCircle, Edit, Building2, Zap
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout, AdminSidebarSections, PageHeader, Button } from '@/components/cbaf';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EconomyDetailPage({ params }: Props) {
  const session = await requireAdmin();
  const { id } = await params;

  // Fetch economy
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, id),
  });

  if (!economy) {
    notFound();
  }

  // Fetch merchants for this economy
  const economyMerchants = await db.query.merchants.findMany({
    where: eq(merchants.economyId, id),
    orderBy: [desc(merchants.registeredAt)],
    limit: 50,
  });

  // Fetch recent videos
  const economyVideos = await db
    .select({
      id: videoSubmissions.id,
      videoTitle: videoSubmissions.videoTitle,
      status: videoSubmissions.status,
      submissionMonth: videoSubmissions.submissionMonth,
      submittedAt: videoSubmissions.submittedAt,
      reviewedAt: videoSubmissions.reviewedAt,
    })
    .from(videoSubmissions)
    .where(eq(videoSubmissions.economyId, id))
    .orderBy(desc(videoSubmissions.submittedAt))
    .limit(20);

  // Fetch ranking history
  const rankingHistory = await db.query.monthlyRankings.findMany({
    where: eq(monthlyRankings.economyId, id),
    orderBy: [desc(monthlyRankings.month)],
    limit: 6,
  });

  // Calculate statistics
  const stats = {
    totalMerchants: economyMerchants.length,
    verifiedMerchants: economyMerchants.filter(m => m.btcmapVerified).length,
    totalVideos: economyVideos.length,
    approvedVideos: economyVideos.filter(v => v.status === 'approved').length,
    pendingVideos: economyVideos.filter(v => v.status === 'pending').length,
    rejectedVideos: economyVideos.filter(v => v.status === 'rejected').length,
    currentRank: rankingHistory[0]?.overallRank || null,
    bestRank: rankingHistory.length > 0
      ? Math.min(...rankingHistory.map(r => r.overallRank || Infinity))
      : null,
  };  const statusBadges = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    flagged: { label: 'Flagged', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    duplicate: { label: 'Duplicate', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };

  return (
    <DashboardLayout
      sidebar={{
        sections: AdminSidebarSections,
        userRole: session.user.role
      }}
    >
      <PageHeader
        title={economy.economyName}
        description={`${economy.city ? `${economy.city}, ` : ''}${economy.country}`}
        icon={Globe}
        breadcrumbs={[
          { label: 'Admin', href: '/cbaf/admin' },
          { label: 'Economies', href: '/cbaf/admin/economies' },
          { label: economy.economyName }
        ]}
        actions={
          <Link href={`/cbaf/admin/economies/${id}/edit`}>
            <Button variant="secondary" icon={Edit}>Edit Profile</Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto">{/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-5 h-5 text-white/70" />
                <span className="text-sm text-white/70">Videos</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalVideos}</div>
              <div className="text-xs text-white/70">{stats.approvedVideos} approved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-white/70" />
                <span className="text-sm text-white/70">Merchants</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalMerchants}</div>
              <div className="text-xs text-white/70">{stats.verifiedMerchants} verified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-white/70" />
                <span className="text-sm text-white/70">Current Rank</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.currentRank ? `#${stats.currentRank}` : '-'}
              </div>
              <div className="text-xs text-white/70">
                {stats.bestRank ? `Best: #${stats.bestRank}` : 'No rankings'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-white/70" />
                <span className="text-sm text-white/70">Total Points</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {economy.totalVideosApproved || 0}
              </div>
              <div className="text-xs text-white/70">All-time</div>
            </div>
          </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2 text-white">
                <Building2 className="w-6 h-6 text-bitcoin" />
                About
              </h2>
              {economy.description ? (
                <p className="text-gray-300 leading-relaxed">{economy.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </section>

            {/* Merchants Section */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2 text-white">
                <Users className="w-6 h-6 text-bitcoin" />
                Merchants ({economyMerchants.length})
              </h2>
              {economyMerchants.length > 0 ? (
                <div className="space-y-2">
                  {economyMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{merchant.merchantName || 'Unnamed Merchant'}</h3>
                        {merchant.btcmapUrl && (
                          <a
                            href={merchant.btcmapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-bitcoin hover:text-bitcoin/80 flex items-center gap-1"
                          >
                            View on BTCMap <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {merchant.btcmapVerified ? (
                          <span className="flex items-center gap-1 text-sm text-green-400 bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : merchant.verificationError ? (
                          <span className="flex items-center gap-1 text-sm text-red-400 bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/30">
                            <XCircle className="w-4 h-4" />
                            Error
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8">No merchants registered</p>
              )}
            </section>

            {/* Recent Videos Section */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2 text-white">
                <Video className="w-6 h-6 text-bitcoin" />
                Recent Videos ({economyVideos.length})
              </h2>
              {economyVideos.length > 0 ? (
                <div className="space-y-2">
                  {economyVideos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/cbaf/admin/reviews/${video.id}`}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-bitcoin transition-colors">
                          {video.videoTitle || 'Untitled Video'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(video.submittedAt).toLocaleDateString()} • {video.submissionMonth}
                        </p>
                      </div>
                      <div className={`text-xs font-bold px-3 py-1 rounded-lg border ${statusBadges[video.status].color}`}>
                        {statusBadges[video.status].label}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8">No videos submitted</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-heading font-bold mb-4 text-white">Contact</h2>
              <div className="space-y-3">
                {economy.website && (
                  <a
                    href={economy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-bitcoin hover:text-bitcoin/80"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {economy.twitter && (
                  <a
                    href={`https://twitter.com/${economy.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-bitcoin hover:text-bitcoin/80"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">@{economy.twitter.replace('@', '')}</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {economy.lightningAddress && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-mono">{economy.lightningAddress}</span>
                  </div>
                )}
                {economy.googleEmail && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{economy.googleEmail}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Ranking History */}
            {rankingHistory.length > 0 && (
              <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-heading font-bold mb-4 text-white">Ranking History</h2>
                <div className="space-y-3">
                  {rankingHistory.map((ranking) => (
                    <div
                      key={ranking.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <div className="text-sm text-gray-300">{ranking.month}</div>
                        <div className="text-xs text-gray-500">{ranking.videosApproved} videos</div>
                      </div>
                      <div className="text-2xl font-bold text-bitcoin">
                        #{ranking.overallRank || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Account Details */}
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-heading font-bold mb-4 text-white">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Member Since</div>
                  <div className="font-medium text-white">
                    {new Date(economy.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {economy.lastActivityAt && (
                  <div>
                    <div className="text-gray-500 mb-1">Last Activity</div>
                    <div className="font-medium text-white">
                      {new Date(economy.lastActivityAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {economy.isVerified ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-yellow-400">Pending Verification</span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
