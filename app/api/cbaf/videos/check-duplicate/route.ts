import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videoSubmissions, economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Normalize URL (remove query params, trailing slashes, etc.)
    const normalizedUrl = videoUrl.split('?')[0].replace(/\/$/, '');

    // Check if video already exists
    const existingSubmission = await db.query.videoSubmissions.findFirst({
      where: eq(videoSubmissions.videoUrl, normalizedUrl),
    });

    if (existingSubmission) {
      // Fetch the economy separately
      const economy = await db.query.economies.findFirst({
        where: eq(economies.id, existingSubmission.economyId),
      });

      const daysSince = Math.floor(
        (Date.now() - existingSubmission.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return NextResponse.json({
        isDuplicate: true,
        originalEconomy: economy?.economyName || 'Unknown',
        submittedAt: existingSubmission.submittedAt.toISOString(),
        status: existingSubmission.status,
        timeSinceSubmission: daysSince === 0 ? 'Today' :
          daysSince === 1 ? '1 day ago' :
          `${daysSince} days ago`,
      });
    }

    return NextResponse.json({
      isDuplicate: false,
    });

  } catch (error) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}
