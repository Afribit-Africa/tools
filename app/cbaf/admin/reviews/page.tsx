import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies, videoMerchants, merchants } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { Video, ExternalLink, Users, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import { Badge, EmptyState, DashboardLayout, AdminSidebarSections, PageHeader, Button } from '@/components/cbaf';

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
    <DashboardLayout
      sidebar={{
        sections: AdminSidebarSections,
        userRole: 'admin',
      }}
    >
      <PageHeader
        title="Video Reviews"
        description={statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} submissions` : 'All submissions'}
        icon={Video}
        breadcrumbs={[
          { label: 'Dashboard', href: '/cbaf/dashboard' },
          { label: 'Reviews' },
        ]}
      />
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Link
            href="/cbaf/admin/reviews"
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !statusFilter
                ? 'bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-lg shadow-bitcoin-500/20'
                : 'glass-card hover:bg-white/10 text-white'
            }`}
          >
            All ({counts.all})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=pending"
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/20'
                : 'glass-card hover:bg-white/10 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({counts.pending})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=approved"
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === 'approved'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'glass-card hover:bg-white/10 text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approved ({counts.approved})
          </Link>
          <Link
            href="/cbaf/admin/reviews?status=rejected"
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === 'rejected'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20'
                : 'glass-card hover:bg-white/10 text-white'
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
                className="block glass-card-hover rounded-xl p-6 transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.videoTitle || 'Video thumbnail'}
                        className="w-40 h-24 object-cover rounded-lg border border-white/10"
                      />
                    ) : (
                      <div className="w-40 h-24 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Video Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-lg text-white">
                          {video.videoTitle || 'Untitled Video'}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">
                          by <span className="font-medium text-white/80">{economy?.economyName || 'Unknown'}</span>
                          {economy?.country && ` • ${economy.country}`}
                        </p>
                      </div>
                      <Badge
                        darkMode={true}
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
                      <p className="text-sm text-white/60 mb-3 line-clamp-2">
                        {video.videoDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
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
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400 flex items-center gap-2 backdrop-blur-xl">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Flagged as duplicate video</span>
                      </div>
                    )}

                    {/* Review Info */}
                    {video.reviewedBy && (
                      <p className="text-xs text-white/40">
                        Reviewed {new Date(video.reviewedAt!).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Indicator */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-bitcoin-400 text-sm font-medium">
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
                className="px-4 py-2 text-sm font-medium text-white glass-card hover:bg-white/10 rounded-lg transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm font-medium text-white/30 glass-card rounded-lg cursor-not-allowed">
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
                    <span key={page} className="px-2 text-white/40">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <Link
                    key={page}
                    href={buildPageUrl(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 text-white shadow-lg'
                        : 'text-white glass-card hover:bg-white/10'
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
                className="px-4 py-2 text-sm font-medium text-white glass-card hover:bg-white/10 rounded-lg transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm font-medium text-white/30 glass-card rounded-lg cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        )}

        {/* Pagination Info */}
        {totalCount > 0 && (
          <div className="mt-4 text-center text-sm text-white/60">
            Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, totalCount)} of {totalCount} videos
          </div>
        )}
    </DashboardLayout>
  );
}
