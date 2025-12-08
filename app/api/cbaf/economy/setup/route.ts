import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { requireBCE } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Require BCE authentication
    const session = await requireBCE();
    
    if (!session.user.googleId) {
      return NextResponse.json(
        { error: 'Google ID not found in session' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      economyName,
      slug,
      country,
      city,
      description,
      website,
      twitter,
      telegram,
      lightningAddress,
    } = body;

    // Validate required fields
    if (!economyName || !slug || !country) {
      return NextResponse.json(
        { error: 'Economy name, slug, and country are required' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase alphanumeric with hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingSlug = await db
      .select()
      .from(economies)
      .where(eq(economies.slug, slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: 'This slug is already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Update the economy record
    const result = await db
      .update(economies)
      .set({
        economyName,
        slug,
        country,
        city: city || null,
        description: description || null,
        website: website || null,
        twitter: twitter || null,
        telegram: telegram || null,
        lightningAddress: lightningAddress || null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(economies.googleId, session.user.googleId))
      .returning();

    const economy = Array.isArray(result) ? result[0] : result;

    if (!economy) {
      return NextResponse.json(
        { error: 'Failed to update economy profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      economy: {
        id: economy.id,
        economyName: economy.economyName,
        slug: economy.slug,
        country: economy.country,
        city: economy.city,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Economy setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
