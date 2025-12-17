import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, videoMerchants, economies } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Video, ExternalLink, Users, Calendar, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, Play, Plus } from 'lucide-react';
import Link from 'next/link';
import { Badge, DashboardLayout, BCESidebarSections, PageHeader, Button } from '@/components/cbaf';
import VideoModal from '@/components/cbaf/VideoModal';

export default async function VideosPage() {
  const session = await requireBCEProfile();
  const economyId = session.user.economyId!;

  // Fetch all video submissions for this economy
  const videos = await db.query.videoSubmissions.findMany({
    where: eq(videoSubmissions.economyId, economyId),
    orderBy: [desc(videoSubmissions.submittedAt)],
  });

  // Fetch economy for sidebar
  const economy = await db.query.economies.findFirst({
    where: eq(economies.id, economyId),
  });

  // Group videos by status
  const pending = videos.filter(v => v.status === 'pending');
  const approved = videos.filter(v => v.status === 'approved');
  const rejected = videos.filter(v => v.status === 'rejected');

  return (
    <DashboardLayout
      sidebar={{
        sections: BCESidebarSections,
        userRole: 'bce',
        economyName: economy?.economyName,
      }}
    >
      <PageHeader
        title="Your Videos"
        description={`${videos.length} total submission${videos.length !== 1 ? 's' : ''}`}
        icon={Video}
        breadcrumbs={[
          { label: 'CBAF', href: '/cbaf/dashboard' },
          { label: 'Videos' },
        ]}
        actions={
          <Link href="/cbaf/videos/submit">
            <Button variant="primary" icon={Plus}>
              Submit Video
            </Button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-bitcoin-500/20 rounded-xl">
                <Video className="w-6 h-6 text-bitcoin-400" />
              </div>
              <span className="text-sm font-medium text-white/50">Total</span>
            </div>
            <div className="text-3xl font-bold text-white">{videos.length}</div>
          </div>

          <div className="stat-card-dark-warning">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-yellow-400/70">Pending</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{pending.length}</div>
          </div>

          <div className="stat-card-dark-success">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-400/70">Approved</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{approved.length}</div>
          </div>

          <div className="stat-card-dark-error">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-400/70">Rejected</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{rejected.length}</div>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="glass-card">
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No videos yet</h3>
              <p className="text-white/50 mb-4">Submit your first proof-of-work video to start earning CBAF funding</p>
              <Link href="/cbaf/videos/submit">
                <Button variant="primary" icon={Video}>
                  Submit Your First Video
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="glass-card-hover"
              >
                <div className="flex items-start gap-6">
                  {/* Video Thumbnail/Icon */}
                  <div className="flex-shrink-0">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.videoTitle || 'Video thumbnail'}
                        className="w-32 h-20 object-cover rounded-lg border border-white/10"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
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
                        {video.videoDescription && (
                          <p className="text-sm text-white/60 mt-1 line-clamp-2">
                            {video.videoDescription}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
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
                            video.status === 'approved'
                              ? CheckCircle
                              : video.status === 'rejected'
                              ? XCircle
                              : video.status === 'pending'
                              ? Clock
                              : AlertTriangle
                          }
                        >
                          {video.status}
                        </Badge>
                      </div>
                    </div>

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
                      <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Marked as duplicate - may not be eligible for funding</span>
                      </div>
                    )}

                    {/* Admin Comments */}
                    {video.adminComments && (
                      <div className="mb-3 p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-bitcoin-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-white/50 mb-1">Admin Comment:</p>
                            <p className="text-sm text-white">{video.adminComments}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <VideoModal
                        videoUrl={video.videoUrl}
                        platform={video.platform as any}
                        thumbnail={video.videoThumbnail}
                        title={video.videoTitle || undefined}
                        description={video.videoDescription || undefined}
                        triggerButton={
                          <button className="btn-primary-dark text-sm">
                            <Play className="w-3 h-3 mr-2" />
                            Watch Video
                          </button>
                        }
                      />
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-bitcoin-400 hover:text-bitcoin-300 font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in New Tab
                      </a>
                      {video.reviewedBy && video.reviewedAt && (
                        <span className="text-xs text-white/50">
                          Reviewed {new Date(video.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        {videos.length > 0 && (
          <div className="mt-8 p-6 bg-bitcoin-500/10 border border-bitcoin-500/30 rounded-xl backdrop-blur-xl">
            <h3 className="font-heading font-bold text-white mb-2">💡 Tips for Better Approval Rates</h3>
            <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
              <li>Ensure videos clearly show merchants accepting Bitcoin</li>
              <li>Use unique, non-recycled content for each month</li>
              <li>Register merchants on BTCMap before featuring them</li>
              <li>Provide clear titles and descriptions for context</li>
              <li>Follow up on rejected videos to understand improvement areas</li>
            </ul>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
