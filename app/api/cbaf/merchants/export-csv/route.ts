import { NextRequest, NextResponse } from 'next/server';
import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await requireBCEProfile();
    const economyId = session.user.economyId!;

    // Fetch all merchants
    const economyMerchants = await db
      .select()
      .from(merchants)
      .where(eq(merchants.economyId, economyId));

    // Build CSV content
    const headers = ['btcmap_url', 'merchant_name', 'local_name', 'lightning_address', 'payment_provider', 'btcmap_verified', 'registered_at'];
    const csvRows = [headers.join(',')];

    for (const merchant of economyMerchants) {
      const row = [
        merchant.btcmapUrl,
        merchant.merchantName || '',
        merchant.localName || '',
        merchant.lightningAddress || '',
        merchant.paymentProvider || 'other',
        merchant.btcmapVerified ? 'yes' : 'no',
        merchant.registeredAt.toISOString().slice(0, 10),
      ];

      // Escape commas and quotes in values
      const escapedRow = row.map(value => {
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });

      csvRows.push(escapedRow.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="merchants_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
