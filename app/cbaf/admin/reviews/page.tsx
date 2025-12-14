import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies, videoMerchants, merchants } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { Video, ExternalLink, Users, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge, EmptyState } from '@/components/cbaf';
import FloatingNav from '@/components/ui/FloatingNav';

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10;

export default async function ReviewsPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const params = await searchParams;
  const statusFilter = params.status as 'pending' | 'approved' | 'rejected' | undefined;
  const currentPage = parseInt(params.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build query based on filter
  const whereClause = statusFilter
    ? eq(videoSubmissions.status, statusFilter)
    : undefined;

  // Fetch videos with economy info (paginated)
  const videos = await db
    .select({
      video: videoSubmissions,
      economy: economies,
    })
    .from(videoSubmissions)
    .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
    .where(whereClause)
    .orderBy(desc(videoSubmissions.submittedAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  // Get total count for pagination
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(videoSubmissions)
    .where(whereClause);

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Count by status for filters
  const statusCounts = await db
    .select({
      status: videoSubmissions.status,
      count: sql<number>`count(*)::int`,
    })
    .from(videoSubmissions)
    .groupBy(videoSubmissions.status);

  const counts = {
    all: totalCount,
    pending: statusCounts.find(s => s.status === 'pending')?.count || 0,
    approved: statusCounts.find(s => s.status === 'approved')?.count || 0,
    rejected: statusCounts.find(s => s.status === 'rejected')?.count || 0,
  };

  // Build pagination URL helper
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', page.toString());
    return `/cbaf/admin/reviews?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FloatingNav role={session.user.role} />

      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200 pt-28 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Video Reviews</h1>
              <p className="text-gray-300 mt-1">
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
                ? 'bg-bitcoin-500 text-white'
                : 'bg-white border border-gray-300 hover:border-bitcoin-400 text-gray-900'
            }`}
          >
            All ({counts.all})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=pending"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              statusFilter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white border border-gray-300 hover:border-yellow-400 text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({counts.pending})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=approved"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              statusFilter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-300 hover:border-green-400 text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved ({counts.approved})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=rejected"
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              statusFilter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-white border border-gray-300 hover:border-red-400 text-gray-900'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected ({counts.rejected})
          </Link>
        </div>

        {/* Videos List */}
        {videos.length === 0 ? (
          <EmptyState
            icon={Video}
            title={statusFilter ? `No ${statusFilter} videos` : 'No videos found'}
            description={
              statusFilter === 'pending'
                ? 'All caught up! Check back later for new submissions.'
                : 'Try adjusting your filters to see more results.'
            }
          />
        ) : (
          <div className="space-y-4">
            {videos.map(({ video, economy }) => (
              <Link
                key={video.id}
                href={`/cbaf/admin/reviews/${video.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-bitcoin-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.videoTitle || 'Video thumbnail'}
                        className="w-40 h-24 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="w-40 h-24 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Video Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-lg text-gray-900">
                          {video.videoTitle || 'Untitled Video'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          by <span className="font-medium">{economy?.economyName || 'Unknown'}</span>
                          {economy?.country && ` • ${economy.country}`}
                        </p>
                      </div>
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
                        icon={
                          video.status === 'approved' ? CheckCircle :
                          video.status === 'rejected' ? XCircle :
                          video.status === 'pending' ? Clock : undefined
                        }
                      >
                        {video.status}
                      </Badge>
                    </div>

                    {video.videoDescription && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {video.videoDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Flagged as duplicate video</span>
                      </div>
                    )}

                    {/* Review Info */}
                    {video.reviewedBy && (
                      <p className="text-xs text-gray-500">
                        Reviewed {new Date(video.reviewedAt!).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Indicator */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-bitcoin-600 text-sm font-medium">
                      {video.status === 'pending' ? 'Review →' : 'View Details →'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {/* Previous Button */}
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                ← Previous
              </span>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                const showEllipsis =
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2);

                if (showEllipsis) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <Link
                    key={page}
                    href={buildPageUrl(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-bitcoin-500 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        )}

        {/* Pagination Info */}
        {totalCount > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, totalCount)} of {totalCount} videos
          </div>
        )}
      </main>
    </div>
  );
}
