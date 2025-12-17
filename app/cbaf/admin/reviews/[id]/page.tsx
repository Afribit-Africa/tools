import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { videoSubmissions, economies, videoMerchants, merchants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ReviewForm from './ReviewForm';
import AddressVerificationPanel from './AddressVerificationPanel';
import VideoEmbed from '@/components/cbaf/VideoEmbed';
import { Video, ExternalLink, Users, Calendar, MapPin, CheckCircle, XCircle, Clock, AlertTriangle, Wallet, Send, Home, FileVideo } from 'lucide-react';
import { Badge, DashboardLayout, AdminSidebarSections, PageHeader } from '@/components/cbaf';

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
    <DashboardLayout
      sidebar={{
        sections: AdminSidebarSections,
        userRole: 'admin',
      }}
    >
      <PageHeader
        title={video.videoTitle || 'Untitled Video'}
        description={`${economy?.economyName || 'Unknown Economy'}${economy?.country ? ` • ${economy.country}` : ''} • ${new Date(video.submittedAt).toLocaleDateString()}`}
        icon={FileVideo}
        breadcrumbs={[
          { label: 'Dashboard', href: '/cbaf/dashboard' },
          { label: 'Reviews', href: '/cbaf/admin/reviews' },
          { label: 'Review Video' },
        ]}
        actions={
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
        }
      />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player/Preview */}
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-heading font-bold mb-4 text-white">Video Content</h2>

              {/* Show warning if platform is unknown or other */}
              {(!video.platform || video.platform === 'other') && (
                <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3 backdrop-blur-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-300">Unsupported Video Platform</p>
                    <p className="text-xs text-yellow-400/80 mt-1">
                      This video URL may not be from a supported platform (YouTube, Twitter, TikTok, Instagram).
                      You may need to open it in a new tab to review the content.
                    </p>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-yellow-300 hover:text-yellow-200 font-medium inline-flex items-center gap-1 mt-2"
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
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-xl">
                  <p className="text-sm text-white/60 font-medium mb-2">Description:</p>
                  <p className="text-sm text-white">{video.videoDescription}</p>
                </div>
              )}
            </div>

            {/* Duplicate Warning */}
            {video.isDuplicate && (
              <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-300 mb-2">Duplicate Video Detected</h3>
                    {duplicateInfo && (
                      <div className="text-sm text-white/70 space-y-1">
                        <p>Original submission by: <span className="font-medium text-white">{duplicateInfo.economy?.economyName}</span></p>
                        <p>Submitted on: {new Date(duplicateInfo.video.submittedAt).toLocaleDateString()}</p>
                        <p>Status: <span className="capitalize">{duplicateInfo.video.status}</span></p>
                        <a
                          href={`/cbaf/admin/reviews/${duplicateInfo.video.id}`}
                          className="text-bitcoin-400 hover:text-bitcoin-300 inline-block mt-2 font-medium"
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
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Featured Merchants ({videoMerchantData.length})
              </h2>

              {videoMerchantData.length === 0 ? (
                <p className="text-white/50 text-sm">No merchants tagged</p>
              ) : (
                <div className="space-y-3">
                  {videoMerchantData.map(({ merchant }) => (
                    merchant && (
                      <div key={merchant.id} className="p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">
                              {merchant.localName || merchant.merchantName || 'Unnamed Merchant'}
                            </h3>
                            {merchant.category && (
                              <p className="text-xs text-white/50">{merchant.category}</p>
                            )}
                          </div>
                          <Badge
                            darkMode={true}
                            variant={merchant.btcmapVerified ? 'success' : 'warning'}
                            icon={merchant.btcmapVerified ? CheckCircle : Clock}
                          >
                            {merchant.btcmapVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>

                        {merchant.address && (
                          <p className="text-xs text-white/60 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {merchant.address}
                          </p>
                        )}

                        {/* Payment Address Section */}
                        {merchant.lightningAddress && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-white/70 flex items-center gap-1">
                                <Wallet className="w-3 h-3" />
                                Payment Address
                              </p>
                              {merchant.addressVerified ? (
                                <Badge darkMode={true} variant="success" icon={CheckCircle}>Verified</Badge>
                              ) : (
                                <Badge darkMode={true} variant="warning" icon={Clock}>Unverified</Badge>
                              )}
                            </div>
                            <div className="bg-black/50 rounded p-2 border border-white/10 mb-2">
                              <p className="text-xs font-mono text-white break-all">
                                {merchant.lightningAddress}
                              </p>
                              <p className="text-xs text-white/50 mt-1">
                                Provider: <span className="capitalize">{merchant.paymentProvider || 'unknown'}</span>
                              </p>
                            </div>
                            {merchant.addressVerificationError && (
                              <p className="text-xs text-red-400 flex items-center gap-1">
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
                          className="text-xs text-bitcoin-400 hover:text-bitcoin-300 flex items-center gap-1 font-medium mt-2"
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
            <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-heading font-bold mb-4 text-white">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/50 mb-1">Platform</p>
                  <p className="font-medium capitalize text-white">{video.platform || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Funding Month</p>
                  <p className="font-medium text-white">{video.submissionMonth || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Submitted</p>
                  <p className="font-medium text-white">{new Date(video.submittedAt).toLocaleString()}</p>
                </div>
                {video.reviewedAt && (
                  <div>
                    <p className="text-white/50 mb-1">Reviewed</p>
                    <p className="font-medium text-white">{new Date(video.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/50 mb-1">Merchants</p>
                  <p className="font-medium text-white">{video.merchantCount || 0}</p>
                </div>
                {video.videoDuration && (
                  <div>
                    <p className="text-white/50 mb-1">Duration</p>
                    <p className="font-medium text-white">{Math.floor(video.videoDuration / 60)}:{(video.videoDuration % 60).toString().padStart(2, '0')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Economy Info */}
            {economy && (
              <div className="glass-card rounded-xl p-6 backdrop-blur-xl">
                <h2 className="text-lg font-heading font-bold mb-4 text-white">Economy</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">Name</p>
                    <p className="font-medium text-white">{economy.economyName}</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Location</p>
                    <p className="font-medium text-white">
                      {economy.city ? `${economy.city}, ` : ''}{economy.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Total Videos</p>
                    <p className="font-medium text-white">{economy.totalVideosSubmitted || 0} submitted</p>
                    <p className="font-medium text-white">{economy.totalVideosApproved || 0} approved</p>
                  </div>
                  {economy.website && (
                    <a
                      href={economy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bitcoin-400 hover:text-bitcoin-300 flex items-center gap-1 font-medium"
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
    </DashboardLayout>
  );
}
