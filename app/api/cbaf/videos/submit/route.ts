import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoSubmissions, economies } from '@/lib/db/schema';
import {
  checkDuplicateVideo,
  generateVideoUrlHash,
  detectVideoPlatform,
  extractVideoId,
} from '@/lib/cbaf/duplicate-detection';
import { eq } from 'drizzle-orm';

/**
 * POST /api/cbaf/videos/submit
 * Submit a new Proof of Work video
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware to get economyId from session
    // For now, we'll expect it in the request body
    const body = await request.json();
    const { economyId, videoUrl, videoTitle, videoDescription, merchantIds } = body;

    // Validation
    if (!economyId || !videoUrl) {
      return NextResponse.json(
        { error: 'Economy ID and video URL are required' },
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

    // Create video submission
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
        merchantCount: merchantIds?.length || 0,
        status: 'pending',
      })
      .returning();
    
    const submission = Array.isArray(result) ? result[0] : result;

    // TODO: Link merchants to video (insert into video_merchants table)
    // This will be implemented in the next phase

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
