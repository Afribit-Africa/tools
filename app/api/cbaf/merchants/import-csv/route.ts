import { NextRequest, NextResponse } from 'next/server';
import { requireBCEProfile } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface CSVRow {
  btcmap_url: string;
  merchant_name?: string;
  local_name?: string;
  lightning_address: string;
  payment_provider?: 'blink' | 'fedi' | 'machankura' | 'other';
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireBCEProfile();
    const economyId = session.user.economyId!;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read CSV content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Validate required columns
    const requiredColumns = ['btcmap_url', 'lightning_address'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse rows
    const rows: CSVRow[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (!row.btcmap_url) {
        errors.push({
          row: i + 1,
          error: 'Missing btcmap_url',
          data: row
        });
        continue;
      }

      if (!row.lightning_address) {
        errors.push({
          row: i + 1,
          error: 'Missing lightning_address',
          data: row
        });
        continue;
      }

      // Validate BTCMap URL format
      if (!row.btcmap_url.includes('btcmap.org')) {
        errors.push({
          row: i + 1,
          error: 'Invalid BTCMap URL format',
          data: row
        });
        continue;
      }

      rows.push({
        btcmap_url: row.btcmap_url,
        merchant_name: row.merchant_name || undefined,
        local_name: row.local_name || undefined,
        lightning_address: row.lightning_address,
        payment_provider: (row.payment_provider as any) || 'blink',
      });
    }

    // Import merchants
    let successCount = 0;

    for (const row of rows) {
      try {
        // Check if merchant already exists
        const existing = await db
          .select()
          .from(merchants)
          .where(
            and(
              eq(merchants.economyId, economyId),
              eq(merchants.btcmapUrl, row.btcmap_url)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing merchant
          await db
            .update(merchants)
            .set({
              merchantName: row.merchant_name || existing[0].merchantName,
              localName: row.local_name || existing[0].localName,
              lightningAddress: row.lightning_address,
              paymentProvider: row.payment_provider || existing[0].paymentProvider,
              updatedAt: new Date(),
            })
            .where(eq(merchants.id, existing[0].id));
        } else {
          // Insert new merchant
          await db.insert(merchants).values({
            economyId,
            btcmapUrl: row.btcmap_url,
            merchantName: row.merchant_name || null,
            localName: row.local_name || null,
            lightningAddress: row.lightning_address,
            paymentProvider: row.payment_provider || 'blink',
            btcmapVerified: false,
            registeredAt: new Date(),
          });
        }

        successCount++;
      } catch (error) {
        console.error('Error importing merchant:', error);
        errors.push({
          row: rows.indexOf(row) + 2, // +2 because of header and 0-index
          error: error instanceof Error ? error.message : 'Failed to import',
          data: row
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        success: successCount,
        failed: errors.length,
        errors: errors.slice(0, 50), // Limit error details to 50
      }
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
