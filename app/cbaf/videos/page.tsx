import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, videoMerchants } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Video, ExternalLink, Users, Calendar, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      {/* Header */}
      <header className="border-b border-border-primary bg-bg-secondary/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Your Videos</h1>
              <p className="text-text-secondary mt-1">
                {videos.length} total submission{videos.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/cbaf/dashboard" className="btn-secondary">
                ← Back to Dashboard
              </Link>
              <Link href="/cbaf/videos/submit" className="btn-primary">
                <Video className="w-4 h-4 mr-2" />
                Submit Video
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-bitcoin" />
              <div>
                <p className="text-2xl font-bold">{videos.length}</p>
                <p className="text-xs text-text-muted">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pending.length}</p>
                <p className="text-xs text-text-muted">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{approved.length}</p>
                <p className="text-xs text-text-muted">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{rejected.length}</p>
                <p className="text-xs text-text-muted">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="bg-bg-secondary border border-border-primary rounded-xl p-12 text-center">
            <Video className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">No videos yet</h2>
            <p className="text-text-muted mb-6">
              Submit your first proof-of-work video to start earning CBAF funding
            </p>
            <Link href="/cbaf/videos/submit" className="btn-primary inline-flex items-center">
              <Video className="w-4 h-4 mr-2" />
              Submit Your First Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg hover:border-bitcoin/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Video Thumbnail/Icon */}
                  <div className="flex-shrink-0">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.videoTitle || 'Video thumbnail'}
                        className="w-32 h-20 object-cover rounded-lg border border-border-primary"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-bg-primary rounded-lg border border-border-primary flex items-center justify-center">
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
                        {video.videoDescription && (
                          <p className="text-sm text-text-muted mt-1 line-clamp-2">
                            {video.videoDescription}
                          </p>
                        )}
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
                        {video.status === 'flagged' && <AlertTriangle className="w-3 h-3" />}
                        {video.status}
                      </span>
                    </div>

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
                        <span>Marked as duplicate - may not be eligible for funding</span>
                      </div>
                    )}

                    {/* Admin Comments */}
                    {video.adminComments && (
                      <div className="mb-3 p-3 bg-bg-primary rounded border border-border-primary">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-bitcoin flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-text-muted mb-1">Admin Comment:</p>
                            <p className="text-sm">{video.adminComments}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-bitcoin hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Video
                      </a>
                      {video.reviewedBy && video.reviewedAt && (
                        <span className="text-xs text-text-muted">
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
          <div className="mt-8 p-6 bg-bitcoin/10 border border-bitcoin/30 rounded-xl">
            <h3 className="font-heading font-bold mb-2">💡 Tips for Better Approval Rates</h3>
            <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
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
