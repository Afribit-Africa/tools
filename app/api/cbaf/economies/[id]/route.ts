import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/cbaf/economies/[id] - Get economy details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const economy = await db.query.economies.findFirst({
      where: eq(economies.id, id),
    });    if (!economy) {
      return NextResponse.json(
        { error: 'Economy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(economy);
  } catch (error) {
    console.error('Error fetching economy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cbaf/economies/[id] - Update economy
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the economy
    const economy = await db.query.economies.findFirst({
      where: eq(economies.id, id),
    });    if (!economy) {
      return NextResponse.json(
        { error: 'Economy not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isBCE = session.user.role === 'bce';
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    const isOwnEconomy = session.user.email === economy.googleEmail;

    // BCE users can only edit their own economy
    if (isBCE && !isOwnEconomy) {
      return NextResponse.json(
        { error: 'BCE users can only edit their own economy' },
        { status: 403 }
      );
    }

    // Admins can edit any economy
    if (!isBCE && !isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define updatable fields
    const updateData: any = {};

    // Fields that both BCE and Admin can update
    if (body.city !== undefined) updateData.city = body.city;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.twitter !== undefined) updateData.twitter = body.twitter;
    if (body.lightningAddress !== undefined) updateData.lightningAddress = body.lightningAddress;

    // Admin-only fields
    if (isAdmin) {
      if (body.isVerified !== undefined) updateData.isVerified = body.isVerified;
    }

    // Always update lastActivityAt
    updateData.lastActivityAt = new Date();

    // Update the economy
    await db
      .update(economies)
      .set(updateData)
      .where(eq(economies.id, id));

    // Fetch updated economy
    const updatedEconomy = await db.query.economies.findFirst({
      where: eq(economies.id, id),
    });

    return NextResponse.json(updatedEconomy);
  } catch (error) {
    console.error('Error updating economy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
