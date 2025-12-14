import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = neon(process.env.DATABASE_URL!);

async function applyMigrations() {
  try {
    console.log('📦 Applying CBAF Phase A migrations...\n');

    // Drop conflicting view
    console.log('🔧 Dropping validation_session_stats view...');
    await sql`DROP VIEW IF EXISTS validation_session_stats CASCADE`;
    console.log('✅ View dropped\n');

    // Migration 1: Add payment fields to merchants
    console.log('🔧 Adding payment fields to merchants table...');

    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS lightning_address VARCHAR(255)`;
    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'blink'`;
    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verification_error TEXT`;
    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verified_at TIMESTAMPTZ`;
    await sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verified_by UUID REFERENCES admin_users(id)`;

    await sql`CREATE INDEX IF NOT EXISTS merchant_address_verified_idx ON merchants(address_verified)`;
    await sql`CREATE INDEX IF NOT EXISTS merchant_payment_provider_idx ON merchants(payment_provider)`;

    await sql`ALTER TABLE merchants DROP CONSTRAINT IF EXISTS payment_provider_check`;
    await sql`ALTER TABLE merchants ADD CONSTRAINT payment_provider_check CHECK (payment_provider IN ('blink', 'fedi', 'machankura', 'other'))`;

    console.log('✅ Merchants table updated\n');

    // Migration 2: Add contact email to economies
    console.log('🔧 Adding contact_email to economies table...');

    await sql`ALTER TABLE economies ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)`;
    await sql`UPDATE economies SET contact_email = google_email WHERE contact_email IS NULL`;
    await sql`CREATE INDEX IF NOT EXISTS economy_contact_email_idx ON economies(contact_email)`;

    console.log('✅ Economies table updated\n');

    // Migration 3: Add address review fields to video_submissions
    console.log('🔧 Adding address review fields to video_submissions table...');

    await sql`ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS addresses_verified BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS addresses_verified_at TIMESTAMPTZ`;
    await sql`ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS invalid_addresses_count INTEGER DEFAULT 0`;
    await sql`CREATE INDEX IF NOT EXISTS video_addresses_verified_idx ON video_submissions(addresses_verified)`;

    console.log('✅ Video submissions table updated\n');

    // Migration 4: Create email_notifications table
    console.log('🔧 Creating email_notifications table...');

    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'email_notifications'
      )
    `;

    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE email_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          video_id UUID REFERENCES video_submissions(id) ON DELETE CASCADE,
          economy_id UUID REFERENCES economies(id) ON DELETE CASCADE,
          recipient_email VARCHAR(255) NOT NULL,
          email_type VARCHAR(50) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          sent_at TIMESTAMPTZ,
          opened_at TIMESTAMPTZ,
          error_message TEXT,
          retry_count INTEGER DEFAULT 0,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`CREATE INDEX email_video_idx ON email_notifications(video_id)`;
      await sql`CREATE INDEX email_economy_idx ON email_notifications(economy_id)`;
      await sql`CREATE INDEX email_status_idx ON email_notifications(status)`;
      await sql`CREATE INDEX email_type_idx ON email_notifications(email_type)`;

      console.log('✅ Email notifications table created\n');
    } else {
      console.log('✅ Email notifications table already exists\n');
    }

    console.log('✅ All migrations applied successfully!\n');

    // Verify schema changes
    const merchants = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'merchants'
      AND column_name IN ('lightning_address', 'payment_provider', 'address_verified')
      ORDER BY column_name;
    `;

    console.log('📊 Verified new columns in merchants table:');
    merchants.forEach(col => {
      console.log(`  ✓ ${col.column_name} (${col.data_type})`);
    });

    const economies = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'economies'
      AND column_name = 'contact_email';
    `;

    if (economies.length > 0) {
      console.log('\n📊 Verified new columns in economies table:');
      economies.forEach(col => {
        console.log(`  ✓ ${col.column_name} (${col.data_type})`);
      });
    }

    const emailNotifications = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'email_notifications'
      );
    `;

    if (emailNotifications[0].exists) {
      console.log('\n✅ email_notifications table created successfully');
    }

    console.log('\n✨ Database is ready for CBAF payment verification!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigrations();
