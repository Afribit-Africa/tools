import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoSubmissions, economies, merchants, videoMerchants } from '@/lib/db/schema';
import {
  checkDuplicateVideo,
  generateVideoUrlHash,
  detectVideoPlatform,
  extractVideoId,
} from '@/lib/cbaf/duplicate-detection';
import { eq, and } from 'drizzle-orm';
import { requireBCEProfile } from '@/lib/auth/session';
import { verifyMerchant, extractOsmNodeId } from '@/lib/btcmap/verify-merchant';

/**
 * POST /api/cbaf/videos/submit
 * Submit a new Proof of Work video
 */
export async function POST(request: NextRequest) {
  try {
    // Require BCE authentication and get economyId from session
    const session = await requireBCEProfile();
    const economyId = session.user.economyId;

    if (!economyId) {
      return NextResponse.json(
        { error: 'Economy profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { videoUrl, videoTitle, videoDescription, merchantBtcmapUrls, merchantLocalNames } = body;

    // Validation
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Verify economy exists
    const economy = await db.query.economies.findFirst({
      where: eq(economies.id, economyId),
    });

    if (!economy) {
      return NextResponse.json(
        { error: 'Economy not found' },
        { status: 404 }
      );
    }

    if (!economy.isActive) {
      return NextResponse.json(
        { error: 'Economy is not active' },
        { status: 403 }
      );
    }

    // Check for duplicate video
    const duplicateCheck = await checkDuplicateVideo(videoUrl, economyId);

    if (duplicateCheck.isDuplicate) {
      // Return error with details about the duplicate
      return NextResponse.json(
        {
          error: 'Duplicate video detected',
          message: duplicateCheck.message,
          originalSubmission: {
            id: duplicateCheck.originalSubmission.id,
            submittedAt: duplicateCheck.originalSubmission.submittedAt,
            status: duplicateCheck.originalSubmission.status,
            economyId: duplicateCheck.originalSubmission.economyId,
          },
        },
        { status: 409 } // Conflict
      );
    }

    // Generate video URL hash
    const videoUrlHash = generateVideoUrlHash(videoUrl);

    // Detect platform
    const platform = detectVideoPlatform(videoUrl);

    // Extract video ID
    const videoId = extractVideoId(videoUrl);

    // Get current month and year
    const now = new Date();
    const submissionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const submissionYear = now.getFullYear();

    // Create video submission (will update merchantCount later)
    const result = await db
      .insert(videoSubmissions)
      .values({
        economyId,
        videoUrl,
        videoUrlHash,
        videoTitle,
        videoDescription,
        platform,
        videoId,
        submissionMonth,
        submissionYear,
        merchantCount: 0,
        status: 'pending',
      })
      .returning();

    const submission = Array.isArray(result) ? result[0] : result;

    // Register/lookup merchants and link to video
    const merchantIds: string[] = [];

    if (merchantBtcmapUrls && Array.isArray(merchantBtcmapUrls)) {
      for (let i = 0; i < merchantBtcmapUrls.length; i++) {
        const btcmapUrl = merchantBtcmapUrls[i];
        const localName = merchantLocalNames?.[i] || null;

        if (!btcmapUrl || !btcmapUrl.trim()) continue;

        try {
          // Check if merchant already exists for this economy
          let merchant = await db.query.merchants.findFirst({
            where: and(
              eq(merchants.economyId, economyId),
              eq(merchants.btcmapUrl, btcmapUrl)
            ),
          });

          // If merchant doesn't exist, register it
          if (!merchant) {
            const osmNodeId = extractOsmNodeId(btcmapUrl);
            let verifiedInfo = null;
            let verificationError = null;

            try {
              verifiedInfo = await verifyMerchant(btcmapUrl);
              if (!verifiedInfo) {
                verificationError = 'Merchant not found on BTCMap';
              }
            } catch (err) {
              console.error('BTCMap verification failed:', err);
              verificationError = 'Failed to verify with BTCMap';
            }

            const merchantResult = await db
              .insert(merchants)
              .values({
                economyId,
                btcmapUrl,
                osmNodeId: verifiedInfo?.osmNodeId || osmNodeId,
                merchantName: verifiedInfo?.name || null,
                category: verifiedInfo?.category || null,
                latitude: verifiedInfo?.latitude?.toString() || null,
                longitude: verifiedInfo?.longitude?.toString() || null,
                address: verifiedInfo?.address
                  ? `${verifiedInfo.address}${verifiedInfo.city ? `, ${verifiedInfo.city}` : ''}${verifiedInfo.country ? `, ${verifiedInfo.country}` : ''}`
                  : null,
                localName: localName || null,
                btcmapVerified: !!verifiedInfo,
                verificationError,
                lastVerifiedAt: verifiedInfo ? new Date() : null,
                isActive: true,
                registeredAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();

            merchant = Array.isArray(merchantResult) ? merchantResult[0] : merchantResult;
          }

          if (merchant && merchant.id) {
            merchantIds.push(merchant.id);

            // Determine if this is the merchant's first appearance
            const isNewMerchant = !merchant.firstAppearanceDate;

            // Link merchant to video
            await db.insert(videoMerchants).values({
              videoId: submission.id,
              merchantId: merchant.id,
              isNewMerchant,
              linkedAt: new Date(),
            });
          }
        } catch (err) {
          console.error(`Error processing merchant ${btcmapUrl}:`, err);
          // Continue with other merchants even if one fails
        }
      }
    }

    // Update merchant count on video submission
    if (merchantIds.length > 0) {
      await db
        .update(videoSubmissions)
        .set({
          merchantCount: merchantIds.length,
        })
        .where(eq(videoSubmissions.id, submission.id));
    }

    // Update economy statistics
    await db
      .update(economies)
      .set({
        totalVideosSubmitted: (economy.totalVideosSubmitted || 0) + 1,
        lastActivityAt: now,
        updatedAt: now,
      })
      .where(eq(economies.id, economyId));

    return NextResponse.json(
      {
        success: true,
        submission: {
          id: submission.id,
          videoUrl: submission.videoUrl,
          status: submission.status,
          submittedAt: submission.submittedAt,
          submissionMonth: submission.submissionMonth,
        },
        message: 'Video submitted successfully and is pending review',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting video:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit video',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cbaf/videos/check-duplicate?url=<video_url>
 * Check if a video URL is a duplicate before submission
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');
    const economyId = searchParams.get('economyId');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const duplicateCheck = await checkDuplicateVideo(
      videoUrl,
      economyId || undefined
    );

    return NextResponse.json({
      isDuplicate: duplicateCheck.isDuplicate,
      message: duplicateCheck.message,
      originalSubmission: duplicateCheck.isDuplicate
        ? {
            id: duplicateCheck.originalSubmission.id,
            submittedAt: duplicateCheck.originalSubmission.submittedAt,
            status: duplicateCheck.originalSubmission.status,
            submissionMonth: duplicateCheck.originalSubmission.submissionMonth,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return NextResponse.json(
      {
        error: 'Failed to check for duplicates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
