import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, videoMerchants } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Video, ExternalLink, Users, Calendar, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, Play } from 'lucide-react';
import Link from 'next/link';
import { Badge, EmptyState, StatCard } from '@/components/cbaf';
import VideoModal from '@/components/cbaf/VideoModal';

export default async function VideosPage() {
  const session = await requireBCEProfile();
  const economyId = session.user.economyId!;

  // Fetch all video submissions for this economy
  const videos = await db.query.videoSubmissions.findMany({
    where: eq(videoSubmissions.economyId, economyId),
    orderBy: [desc(videoSubmissions.submittedAt)],
  });

  // Group videos by status
  const pending = videos.filter(v => v.status === 'pending');
  const approved = videos.filter(v => v.status === 'approved');
  const rejected = videos.filter(v => v.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Your Videos</h1>
              <p className="text-gray-300 mt-1">
                {videos.length} total submission{videos.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/cbaf/dashboard" className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors">
                ← Back to Dashboard
              </Link>
              <Link href="/cbaf/videos/submit" className="btn-primary flex items-center gap-2">
                <Video className="w-4 h-4" />
                Submit Video
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total"
            value={videos.length.toString()}
            icon={Video}
            iconBgColor="bg-bitcoin-100"
            iconColor="text-bitcoin-600"
          />
          <StatCard
            title="Pending Review"
            value={pending.length.toString()}
            icon={Clock}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Approved"
            value={approved.length.toString()}
            icon={CheckCircle}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="Rejected"
            value={rejected.length.toString()}
            icon={XCircle}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />
        </div>

        {videos.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No videos yet"
            description="Submit your first proof-of-work video to start earning CBAF funding"
          >
            <Link href="/cbaf/videos/submit" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Video className="w-4 h-4" />
              Submit Your First Video
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-bitcoin-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Video Thumbnail/Icon */}
                  <div className="flex-shrink-0">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.videoTitle || 'Video thumbnail'}
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
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
                        {video.videoDescription && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {video.videoDescription}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
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
                        <span>Marked as duplicate - may not be eligible for funding</span>
                      </div>
                    )}

                    {/* Admin Comments */}
                    {video.adminComments && (
                      <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-bitcoin-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Admin Comment:</p>
                            <p className="text-sm text-gray-900">{video.adminComments}</p>
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
                          <button className="text-sm bg-bitcoin-500 hover:bg-bitcoin-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                            <Play className="w-3 h-3" />
                            Watch Video
                          </button>
                        }
                      />
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in New Tab
                      </a>
                      {video.reviewedBy && video.reviewedAt && (
                        <span className="text-xs text-gray-500">
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
          <div className="mt-8 p-6 bg-bitcoin-50 border-2 border-bitcoin-200 rounded-xl">
            <h3 className="font-heading font-bold text-gray-900 mb-2">💡 Tips for Better Approval Rates</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Ensure videos clearly show merchants accepting Bitcoin</li>
              <li>Use unique, non-recycled content for each month</li>
              <li>Register merchants on BTCMap before featuring them</li>
              <li>Provide clear titles and descriptions for context</li>
              <li>Follow up on rejected videos to understand improvement areas</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
