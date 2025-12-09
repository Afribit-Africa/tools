import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies, videoMerchants, merchants } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { Video, ExternalLink, Users, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: { status?: string };
}

export default async function ReviewsPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const statusFilter = searchParams.status as 'pending' | 'approved' | 'rejected' | undefined;

  // Build query based on filter
  const whereClause = statusFilter
    ? eq(videoSubmissions.status, statusFilter)
    : undefined;

  // Fetch videos with economy info
  const videos = await db
    .select({
      video: videoSubmissions,
      economy: economies,
    })
    .from(videoSubmissions)
    .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
    .where(whereClause)
    .orderBy(desc(videoSubmissions.submittedAt))
    .limit(50);

  // Count by status for filters
  const statusCounts = await db
    .select({
      status: videoSubmissions.status,
      count: sql<number>`count(*)::int`,
    })
    .from(videoSubmissions)
    .groupBy(videoSubmissions.status);

  const counts = {
    all: videos.length,
    pending: statusCounts.find(s => s.status === 'pending')?.count || 0,
    approved: statusCounts.find(s => s.status === 'approved')?.count || 0,
    rejected: statusCounts.find(s => s.status === 'rejected')?.count || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Video Reviews</h1>
              <p className="text-text-secondary mt-1">
                {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} submissions` : 'All submissions'}
              </p>
            </div>
            <Link href="/cbaf/admin" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          <Link
            href="/cbaf/admin/reviews"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !statusFilter
                ? 'bg-bitcoin text-black'
                : 'bg-bg-secondary border border-border-primary hover:border-bitcoin/50'
            }`}
          >
            All ({counts.all})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=pending"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              statusFilter === 'pending'
                ? 'bg-yellow-500 text-black'
                : 'bg-bg-secondary border border-border-primary hover:border-yellow-500/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({counts.pending})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=approved"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              statusFilter === 'approved'
                ? 'bg-green-500 text-black'
                : 'bg-bg-secondary border border-border-primary hover:border-green-500/50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved ({counts.approved})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=rejected"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              statusFilter === 'rejected'
                ? 'bg-red-500 text-black'
                : 'bg-bg-secondary border border-border-primary hover:border-red-500/50'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected ({counts.rejected})
          </Link>
        </div>

        {/* Videos List */}
        {videos.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-12 text-center">
            <Video className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">
              {statusFilter ? `No ${statusFilter} videos` : 'No videos found'}
            </h2>
            <p className="text-text-muted">
              {statusFilter === 'pending'
                ? 'All caught up! Check back later for new submissions.'
                : 'Try adjusting your filters to see more results.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map(({ video, economy }) => (
              <Link
                key={video.id}
                href={`/cbaf/admin/reviews/${video.id}`}
                className="block bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg hover:border-bitcoin/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.videoTitle || 'Video thumbnail'}
                        className="w-40 h-24 object-cover rounded-lg border border-border-primary"
                      />
                    ) : (
                      <div className="w-40 h-24 bg-bg-primary rounded-lg border border-border-primary flex items-center justify-center">
                        <Video className="w-8 h-8 text-text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Video Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-lg">
                          {video.videoTitle || 'Untitled Video'}
                        </h3>
                        <p className="text-sm text-text-muted mt-1">
                          by <span className="font-medium">{economy?.economyName || 'Unknown'}</span>
                          {economy?.country && ` • ${economy.country}`}
                        </p>
                      </div>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          video.status === 'approved'
                            ? 'bg-green-500/10 text-green-500'
                            : video.status === 'rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : video.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {video.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {video.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {video.status === 'pending' && <Clock className="w-3 h-3" />}
                        {video.status}
                      </span>
                    </div>

                    {video.videoDescription && (
                      <p className="text-sm text-text-muted mb-3 line-clamp-2">
                        {video.videoDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(video.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {video.merchantCount || 0} merchants
                      </span>
                      {video.platform && (
                        <span className="capitalize">{video.platform}</span>
                      )}
                      {video.submissionMonth && (
                        <span>Month: {video.submissionMonth}</span>
                      )}
                    </div>

                    {/* Duplicate Warning */}
                    {video.isDuplicate && (
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-500 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Flagged as duplicate video</span>
                      </div>
                    )}

                    {/* Review Info */}
                    {video.reviewedBy && (
                      <p className="text-xs text-text-muted">
                        Reviewed {new Date(video.reviewedAt!).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Indicator */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-bitcoin text-sm font-medium">
                      {video.status === 'pending' ? 'Review →' : 'View Details →'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
