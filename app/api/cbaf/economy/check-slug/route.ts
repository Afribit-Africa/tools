import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { available: false, reason: 'Invalid format' },
        { status: 200 }
      );
    }

    // Get current user's email to exclude their own slug
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // Check if slug exists
    const existing = await db
      .select({ email: economies.googleEmail })
      .from(economies)
      .where(eq(economies.slug, slug))
      .limit(1);

    // Available if not found, or if it belongs to current user
    const available = existing.length === 0 || (userEmail && existing[0].email === userEmail);

    return NextResponse.json({
      available,
      slug,
    });

  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
