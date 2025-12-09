import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoSubmissions, economies, adminUsers, videoMerchants, merchants } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/session';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin();

    // Parse request body
    const body = await request.json();
    const { videoId, action, comment } = body;

    // Validate required fields
    if (!videoId || !action) {
      return NextResponse.json(
        { error: 'Video ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Check permissions
    if (action === 'approve' && !(session.user.canApproveVideos ?? true)) {
      return NextResponse.json(
        { error: 'You do not have permission to approve videos' },
        { status: 403 }
      );
    }

    if (action === 'reject' && !(session.user.canRejectVideos ?? true)) {
      return NextResponse.json(
        { error: 'You do not have permission to reject videos' },
        { status: 403 }
      );
    }

    // Fetch the video
    const video = await db.query.videoSubmissions.findFirst({
      where: eq(videoSubmissions.id, videoId),
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Update video status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const result = await db
      .update(videoSubmissions)
      .set({
        status: newStatus,
        reviewedBy: session.user.adminId || session.user.id,
        reviewedAt: new Date(),
        adminComments: comment || null,
        updatedAt: new Date(),
      })
      .where(eq(videoSubmissions.id, videoId))
      .returning();

    const updatedVideo = Array.isArray(result) ? result[0] : result;

    if (!updatedVideo) {
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      );
    }

    // Update economy statistics
    if (action === 'approve') {
      // Increment totalVideosApproved for the economy
      await db
        .update(economies)
        .set({
          totalVideosApproved: sql`${economies.totalVideosApproved} + 1`,
          lastActivityAt: new Date(),
        })
        .where(eq(economies.id, video.economyId));

      // Update merchant statistics for all merchants linked to this video
      const linkedMerchants = await db
        .select()
        .from(videoMerchants)
        .where(eq(videoMerchants.videoId, videoId));

      for (const link of linkedMerchants) {
        const merchant = await db.query.merchants.findFirst({
          where: eq(merchants.id, link.merchantId),
        });

        if (merchant) {
          await db
            .update(merchants)
            .set({
              timesAppearedInVideos: (merchant.timesAppearedInVideos || 0) + 1,
              firstAppearanceDate: merchant.firstAppearanceDate || new Date(),
              lastAppearanceDate: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(merchants.id, link.merchantId));
        }
      }

      // Note: Ranking recalculation should be triggered manually through Super Admin interface
      // or can be automated here with a background job if needed
    }

    // Update admin's review count
    if (session.user.adminId) {
      await db
        .update(adminUsers)
        .set({
          videosReviewedCount: sql`${adminUsers.videosReviewedCount} + 1`,
          lastLoginAt: new Date(),
        })
        .where(eq(adminUsers.id, session.user.adminId));
    }

    return NextResponse.json({
      success: true,
      video: {
        id: updatedVideo.id,
        status: updatedVideo.status,
        reviewedAt: updatedVideo.reviewedAt,
        adminComments: updatedVideo.adminComments,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Video review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
