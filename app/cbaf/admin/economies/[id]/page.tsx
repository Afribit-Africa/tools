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
import FloatingNav from '@/components/ui/FloatingNav';

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
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-300' },
    flagged: { label: 'Flagged', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    duplicate: { label: 'Duplicate', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-xl pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <Link
                href="/cbaf/admin/economies"
                className="text-sm text-bitcoin-100 hover:text-white mb-3 inline-block font-medium"
              >
                ← Back to Economies
              </Link>
              <div className="flex items-center gap-4 mb-3">
                {/* Logo placeholder */}
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
                  <Globe className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-heading font-bold mb-2">
                    {economy.economyName}
                  </h1>
                  <div className="flex items-center gap-3 text-bitcoin-50">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{economy.city ? `${economy.city}, ` : ''}{economy.country}</span>
                    </div>
                    {economy.isVerified && (
                      <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg border border-green-400/30">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/cbaf/admin/economies/${id}/edit`}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-5 h-5 text-bitcoin-100" />
                <span className="text-sm text-bitcoin-100">Videos</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalVideos}</div>
              <div className="text-xs text-bitcoin-100">{stats.approvedVideos} approved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-bitcoin-100" />
                <span className="text-sm text-bitcoin-100">Merchants</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalMerchants}</div>
              <div className="text-xs text-bitcoin-100">{stats.verifiedMerchants} verified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-bitcoin-100" />
                <span className="text-sm text-bitcoin-100">Current Rank</span>
              </div>
              <div className="text-3xl font-bold">
                {stats.currentRank ? `#${stats.currentRank}` : '-'}
              </div>
              <div className="text-xs text-bitcoin-100">
                {stats.bestRank ? `Best: #${stats.bestRank}` : 'No rankings'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-bitcoin-100" />
                <span className="text-sm text-bitcoin-100">Total Points</span>
              </div>
              <div className="text-3xl font-bold">
                {economy.totalVideosApproved || 0}
              </div>
              <div className="text-xs text-bitcoin-100">All-time</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-bitcoin-600" />
                About
              </h2>
              {economy.description ? (
                <p className="text-gray-700 leading-relaxed">{economy.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided</p>
              )}
            </section>

            {/* Merchants Section */}
            <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-bitcoin-600" />
                Merchants ({economyMerchants.length})
              </h2>
              {economyMerchants.length > 0 ? (
                <div className="space-y-2">
                  {economyMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{merchant.merchantName || 'Unnamed Merchant'}</h3>
                        {merchant.btcmapUrl && (
                          <a
                            href={merchant.btcmapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-bitcoin-600 hover:text-bitcoin-700 flex items-center gap-1"
                          >
                            View on BTCMap <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {merchant.btcmapVerified ? (
                          <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : merchant.verificationError ? (
                          <span className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                            <XCircle className="w-4 h-4" />
                            Error
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-center py-8">No merchants registered</p>
              )}
            </section>

            {/* Recent Videos Section */}
            <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                <Video className="w-6 h-6 text-bitcoin-600" />
                Recent Videos ({economyVideos.length})
              </h2>
              {economyVideos.length > 0 ? (
                <div className="space-y-2">
                  {economyVideos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/cbaf/admin/reviews/${video.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-bitcoin-600 transition-colors">
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
                <p className="text-gray-400 italic text-center py-8">No videos submitted</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h2 className="text-xl font-heading font-bold mb-4">Contact</h2>
              <div className="space-y-3">
                {economy.website && (
                  <a
                    href={economy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-bitcoin-600 hover:text-bitcoin-700"
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
                    className="flex items-center gap-2 text-bitcoin-600 hover:text-bitcoin-700"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">@{economy.twitter.replace('@', '')}</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {economy.lightningAddress && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-mono">{economy.lightningAddress}</span>
                  </div>
                )}
                {economy.googleEmail && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{economy.googleEmail}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Ranking History */}
            {rankingHistory.length > 0 && (
              <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
                <h2 className="text-xl font-heading font-bold mb-4">Ranking History</h2>
                <div className="space-y-3">
                  {rankingHistory.map((ranking) => (
                    <div
                      key={ranking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="text-sm text-gray-600">{ranking.month}</div>
                        <div className="text-xs text-gray-500">{ranking.videosApproved} videos</div>
                      </div>
                      <div className="text-2xl font-bold text-bitcoin-600">
                        #{ranking.overallRank || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Account Details */}
            <section className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h2 className="text-xl font-heading font-bold mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Member Since</div>
                  <div className="font-medium text-gray-900">
                    {new Date(economy.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {economy.lastActivityAt && (
                  <div>
                    <div className="text-gray-500 mb-1">Last Activity</div>
                    <div className="font-medium text-gray-900">
                      {new Date(economy.lastActivityAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {economy.isVerified ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600">Pending Verification</span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
