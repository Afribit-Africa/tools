import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { fundingDisbursements } from '@/lib/db/schema';
import { desc, eq, and, or } from 'drizzle-orm';

/**
 * GET - Get payment history with filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const economyId = searchParams.get('economyId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const conditions = [];

    if (period) {
      conditions.push(eq(fundingDisbursements.fundingMonth, period));
    }

    if (status) {
      conditions.push(eq(fundingDisbursements.status, status as any));
    }

    if (economyId) {
      conditions.push(eq(fundingDisbursements.economyId, economyId));
    }

    // Fetch disbursements
    const query = db
      .select()
      .from(fundingDisbursements)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(fundingDisbursements.createdAt))
      .limit(limit)
      .offset(offset);

    const disbursements = await query;

    // Get total count
    const countResult = await db
      .select({ count: fundingDisbursements.id })
      .from(fundingDisbursements)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = countResult.length;

    // Calculate statistics
    const stats = {
      total: disbursements.length,
      completed: disbursements.filter((d) => d.status === 'completed').length,
      failed: disbursements.filter((d) => d.status === 'failed').length,
      pending: disbursements.filter((d) => d.status === 'pending').length,
      totalAmount: disbursements.reduce((sum, d) => sum + (d.amountSats || 0), 0),
      paidAmount: disbursements
        .filter((d) => d.status === 'completed')
        .reduce((sum, d) => sum + (d.amountSats || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: disbursements,
      totalCount,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + disbursements.length < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch payment history',
      },
      { status: 500 }
    );
  }
}
