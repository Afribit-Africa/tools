import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db/client';
import { economies } from '@/lib/db/schema';
import { eq, isNotNull, and } from 'drizzle-orm';
import { sanitizeAddress } from '@/lib/blink';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active economies with lightning addresses
    const allEconomies = await db
      .select({
        id: economies.id,
        economyName: economies.economyName,
        lightningAddress: economies.lightningAddress,
        country: economies.country,
        city: economies.city,
        contactEmail: economies.contactEmail,
        isActive: economies.isActive,
        isVerified: economies.isVerified,
        totalMerchantsRegistered: economies.totalMerchantsRegistered,
      })
      .from(economies)
      .where(and(eq(economies.isActive, true), isNotNull(economies.lightningAddress)));

    // Process and sanitize addresses
    const processedEconomies = allEconomies.map((economy) => {
      const originalAddress = economy.lightningAddress || '';
      const sanitized = sanitizeAddress(originalAddress);

      return {
        id: economy.id,
        economyName: economy.economyName,
        country: economy.country,
        city: economy.city,
        contactEmail: economy.contactEmail,
        isVerified: economy.isVerified,
        totalMerchants: economy.totalMerchantsRegistered || 0,
        originalAddress,
        cleanedAddress: sanitized.cleaned,
        issues: sanitized.issues,
        hasIssues: sanitized.issues.length > 0,
        status: 'pending' as const,
      };
    });

    // Summary stats
    const stats = {
      total: processedEconomies.length,
      withAddresses: processedEconomies.filter(e => e.cleanedAddress).length,
      withIssues: processedEconomies.filter(e => e.hasIssues).length,
      needsVerification: processedEconomies.length, // All need verification initially
    };

    return NextResponse.json({
      success: true,
      economies: processedEconomies,
      stats,
    });
  } catch (error) {
    console.error('Error collecting addresses:', error);
    return NextResponse.json(
      { error: 'Failed to collect addresses' },
      { status: 500 }
    );
  }
}
