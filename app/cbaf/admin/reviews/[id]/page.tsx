import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies, videoMerchants, merchants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ReviewForm from './ReviewForm';
import AddressVerificationPanel from './AddressVerificationPanel';
import VideoEmbed from '@/components/cbaf/VideoEmbed';
import { Video, ExternalLink, Users, Calendar, MapPin, CheckCircle, XCircle, Clock, AlertTriangle, Wallet, Send } from 'lucide-react';
import { Badge } from '@/components/cbaf';
import FloatingNav from '@/components/ui/FloatingNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewVideoPage({ params }: Props) {
  const session = await requireAdmin();
  const { id } = await params;

  // Fetch video with economy info
  const videoData = await db
    .select({
      video: videoSubmissions,
      economy: economies,
    })
    .from(videoSubmissions)
    .leftJoin(economies, eq(videoSubmissions.economyId, economies.id))
    .where(eq(videoSubmissions.id, id))
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <FloatingNav role={session.user.role} />

      <div className="max-w-5xl mx-auto px-4 pt-28">
        {/* Header */}
        <div className="mb-6">
          <a href="/cbaf/admin/reviews" className="text-sm text-bitcoin-600 hover:text-bitcoin-700 mb-4 inline-block font-medium">
            ← Back to Reviews
          </a>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold mb-2 text-gray-900">
                {video.videoTitle || 'Untitled Video'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-900">{economy?.economyName || 'Unknown Economy'}</span>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player/Preview */}
            <div className="card">
              <h2 className="text-lg font-heading font-bold mb-4 text-gray-900">Video Content</h2>

              {/* Show warning if platform is unknown or other */}
              {(!video.platform || video.platform === 'other') && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Unsupported Video Platform</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      This video URL may not be from a supported platform (YouTube, Twitter, TikTok, Instagram).
                      You may need to open it in a new tab to review the content.
                    </p>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-yellow-700 hover:text-yellow-800 font-medium inline-flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Video URL
                    </a>
                  </div>
                </div>
              )}

              <VideoEmbed
                url={video.videoUrl}
                platform={video.platform as any}
                thumbnail={video.videoThumbnail}
                title={video.videoTitle || undefined}
              />

              {video.videoDescription && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-2">Description:</p>
                  <p className="text-sm text-gray-900">{video.videoDescription}</p>
                </div>
              )}
            </div>

            {/* Duplicate Warning */}
            {video.isDuplicate && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 mb-2">Duplicate Video Detected</h3>
                    {duplicateInfo && (
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>Original submission by: <span className="font-medium">{duplicateInfo.economy?.economyName}</span></p>
                        <p>Submitted on: {new Date(duplicateInfo.video.submittedAt).toLocaleDateString()}</p>
                        <p>Status: <span className="capitalize">{duplicateInfo.video.status}</span></p>
                        <a
                          href={`/cbaf/admin/reviews/${duplicateInfo.video.id}`}
                          className="text-bitcoin-600 hover:text-bitcoin-700 inline-block mt-2 font-medium"
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
            <div className="card">
              <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Users className="w-5 h-5" />
                Featured Merchants ({videoMerchantData.length})
              </h2>

              {videoMerchantData.length === 0 ? (
                <p className="text-gray-500 text-sm">No merchants tagged</p>
              ) : (
                <div className="space-y-3">
                  {videoMerchantData.map(({ merchant }) => (
                    merchant && (
                      <div key={merchant.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                            </h3>
                            {merchant.category && (
                              <p className="text-xs text-gray-500">{merchant.category}</p>
                            )}
                          </div>
                          <Badge
                            variant={merchant.btcmapVerified ? 'success' : 'warning'}
                            icon={merchant.btcmapVerified ? CheckCircle : Clock}
                          >
                            {merchant.btcmapVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>

                        {merchant.address && (
                          <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {merchant.address}
                          </p>
                        )}

                        {/* Payment Address Section */}
                        {merchant.lightningAddress && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <Wallet className="w-3 h-3" />
                                Payment Address
                              </p>
                              {merchant.addressVerified ? (
                                <Badge variant="success" icon={CheckCircle}>Verified</Badge>
                              ) : (
                                <Badge variant="warning" icon={Clock}>Unverified</Badge>
                              )}
                            </div>
                            <div className="bg-white rounded p-2 border border-gray-200 mb-2">
                              <p className="text-xs font-mono text-gray-900 break-all">
                                {merchant.lightningAddress}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Provider: <span className="capitalize">{merchant.paymentProvider || 'unknown'}</span>
                              </p>
                            </div>
                            {merchant.addressVerificationError && (
                              <p className="text-xs text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {merchant.addressVerificationError}
                              </p>
                            )}
                          </div>
                        )}

                        <a
                          href={merchant.btcmapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-bitcoin-600 hover:text-bitcoin-700 flex items-center gap-1 font-medium mt-2"
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

            {/* Payment Address Verification */}
            <AddressVerificationPanel
              videoId={video.id}
              merchants={videoMerchantData.map(({ merchant }) => merchant).filter((m): m is NonNullable<typeof m> => m !== null)}
              economyEmail={economy?.contactEmail || null}
              economyName={economy?.economyName || 'Unknown Economy'}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Details */}
            <div className="card">
              <h2 className="text-lg font-heading font-bold mb-4 text-gray-900">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Platform</p>
                  <p className="font-medium capitalize text-gray-900">{video.platform || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Funding Month</p>
                  <p className="font-medium text-gray-900">{video.submissionMonth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Submitted</p>
                  <p className="font-medium text-gray-900">{new Date(video.submittedAt).toLocaleString()}</p>
                </div>
                {video.reviewedAt && (
                  <div>
                    <p className="text-gray-500 mb-1">Reviewed</p>
                    <p className="font-medium text-gray-900">{new Date(video.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 mb-1">Merchants</p>
                  <p className="font-medium text-gray-900">{video.merchantCount || 0}</p>
                </div>
                {video.videoDuration && (
                  <div>
                    <p className="text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-900">{Math.floor(video.videoDuration / 60)}:{(video.videoDuration % 60).toString().padStart(2, '0')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Economy Info */}
            {economy && (
              <div className="card">
                <h2 className="text-lg font-heading font-bold mb-4 text-gray-900">Economy</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Name</p>
                    <p className="font-medium text-gray-900">{economy.economyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Location</p>
                    <p className="font-medium text-gray-900">
                      {economy.city ? `${economy.city}, ` : ''}{economy.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Total Videos</p>
                    <p className="font-medium text-gray-900">{economy.totalVideosSubmitted || 0} submitted</p>
                    <p className="font-medium text-gray-900">{economy.totalVideosApproved || 0} approved</p>
                  </div>
                  {economy.website && (
                    <a
                      href={economy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bitcoin-600 hover:text-bitcoin-700 flex items-center gap-1 font-medium"
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
              currentComment={video.adminComments || ''}
              canApprove={session.user.canApproveVideos ?? true}
              canReject={session.user.canRejectVideos ?? true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
