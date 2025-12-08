import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies, videoMerchants, merchants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ReviewForm from './ReviewForm';
import { Video, ExternalLink, Users, Calendar, MapPin, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  params: { id: string };
}

export default async function ReviewVideoPage({ params }: Props) {
  const session = await requireAdmin();

  // Fetch video with economy info
  const videoData = await db
    .select({
      video: videoSubmissions,
      economy: economies,
    })
    .from(videoSubmissions)
    .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
    .where(eq(videoSubmissions.id, params.id))
    .limit(1);

  if (videoData.length === 0) {
    notFound();
  }

  const { video, economy } = videoData[0];

  // Fetch associated merchants
  const videoMerchantData = await db
    .select({
      videoMerchant: videoMerchants,
      merchant: merchants,
    })
    .from(videoMerchants)
    .leftJoin(merchants, eq(videoMerchants.merchantId, merchants.id))
    .where(eq(videoMerchants.videoId, video.id));

  // Check if this is a duplicate
  let duplicateInfo = null;
  if (video.isDuplicate && video.duplicateOfId) {
    const originalData = await db
      .select({
        video: videoSubmissions,
        economy: economies,
      })
      .from(videoSubmissions)
      .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
      .where(eq(videoSubmissions.id, video.duplicateOfId))
      .limit(1);

    if (originalData.length > 0) {
      duplicateInfo = {
        video: originalData[0].video,
        economy: originalData[0].economy,
      };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <a href="/cbaf/admin/reviews" className="text-sm text-bitcoin hover:underline mb-4 inline-block">
            ← Back to Reviews
          </a>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold mb-2">
                {video.videoTitle || 'Untitled Video'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="font-medium">{economy?.economyName || 'Unknown Economy'}</span>
                {economy?.country && (
                  <>
                    <span>•</span>
                    <span>{economy.country}</span>
                  </>
                )}
                <span>•</span>
                <span>{new Date(video.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                video.status === 'approved'
                  ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                  : video.status === 'rejected'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                  : video.status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                  : 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
              }`}
            >
              {video.status === 'approved' && <CheckCircle className="w-4 h-4" />}
              {video.status === 'rejected' && <XCircle className="w-4 h-4" />}
              {video.status === 'pending' && <Clock className="w-4 h-4" />}
              {video.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player/Preview */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-heading font-bold mb-4">Video Content</h2>
              
              {/* Embed video if possible */}
              {video.videoPlatform === 'youtube' && video.videoUrl.includes('youtube.com') && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(video.videoUrl)}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {video.videoThumbnail && video.videoPlatform !== 'youtube' && (
                <img
                  src={video.videoThumbnail}
                  alt="Video thumbnail"
                  className="w-full rounded-lg mb-4"
                />
              )}

              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Video in New Tab
              </a>

              {video.videoDescription && (
                <div className="mt-4 p-4 bg-bg-primary rounded-lg">
                  <p className="text-sm text-text-muted font-medium mb-2">Description:</p>
                  <p className="text-sm">{video.videoDescription}</p>
                </div>
              )}
            </div>

            {/* Duplicate Warning */}
            {video.isDuplicate && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-500 mb-2">Duplicate Video Detected</h3>
                    {duplicateInfo && (
                      <div className="text-sm text-text-muted space-y-1">
                        <p>Original submission by: <span className="font-medium">{duplicateInfo.economy?.economyName}</span></p>
                        <p>Submitted on: {new Date(duplicateInfo.video.submittedAt).toLocaleDateString()}</p>
                        <p>Status: <span className="capitalize">{duplicateInfo.video.status}</span></p>
                        <a 
                          href={`/cbaf/admin/reviews/${duplicateInfo.video.id}`}
                          className="text-bitcoin hover:underline inline-block mt-2"
                        >
                          View original submission →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Merchants */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Featured Merchants ({videoMerchantData.length})
              </h2>

              {videoMerchantData.length === 0 ? (
                <p className="text-text-muted text-sm">No merchants tagged</p>
              ) : (
                <div className="space-y-3">
                  {videoMerchantData.map(({ merchant }) => (
                    merchant && (
                      <div key={merchant.id} className="p-4 bg-bg-primary rounded-lg border border-border-primary">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium">
                              {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                            </h3>
                            {merchant.category && (
                              <p className="text-xs text-text-muted">{merchant.category}</p>
                            )}
                          </div>
                          {merchant.btcmapVerified ? (
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>

                        {merchant.address && (
                          <p className="text-xs text-text-muted flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {merchant.address}
                          </p>
                        )}

                        <a
                          href={merchant.btcmapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-bitcoin hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on BTCMap
                        </a>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Details */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-heading font-bold mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-text-muted mb-1">Platform</p>
                  <p className="font-medium capitalize">{video.videoPlatform || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">Funding Month</p>
                  <p className="font-medium">{video.fundingMonth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">Submitted</p>
                  <p className="font-medium">{new Date(video.submittedAt).toLocaleString()}</p>
                </div>
                {video.reviewedAt && (
                  <div>
                    <p className="text-text-muted mb-1">Reviewed</p>
                    <p className="font-medium">{new Date(video.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-text-muted mb-1">Merchants</p>
                  <p className="font-medium">{video.merchantCount || 0}</p>
                </div>
                {video.videoDuration && (
                  <div>
                    <p className="text-text-muted mb-1">Duration</p>
                    <p className="font-medium">{Math.floor(video.videoDuration / 60)}:{(video.videoDuration % 60).toString().padStart(2, '0')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Economy Info */}
            {economy && (
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-heading font-bold mb-4">Economy</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-text-muted mb-1">Name</p>
                    <p className="font-medium">{economy.economyName}</p>
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">Location</p>
                    <p className="font-medium">
                      {economy.city ? `${economy.city}, ` : ''}{economy.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted mb-1">Total Videos</p>
                    <p className="font-medium">{economy.totalVideosSubmitted || 0} submitted</p>
                    <p className="font-medium">{economy.totalVideosApproved || 0} approved</p>
                  </div>
                  {economy.website && (
                    <a
                      href={economy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bitcoin hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Review Form */}
            <ReviewForm 
              videoId={video.id}
              currentStatus={video.status as 'pending' | 'approved' | 'rejected'}
              currentComment={video.reviewComment || ''}
              canApprove={session.user.canApproveVideos ?? true}
              canReject={session.user.canRejectVideos ?? true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : '';
}
