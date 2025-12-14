import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('🚀 Running migration: Add super_admin_settings table...');

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS super_admin_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT NOT NULL UNIQUE,
        encrypted_value TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_connected BOOLEAN DEFAULT false,
        last_tested TIMESTAMP,
        metadata TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Table created successfully');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS settings_key_idx ON super_admin_settings(key);
    `);

    console.log('✅ Index settings_key_idx created');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS settings_active_idx ON super_admin_settings(is_active);
    `);

    console.log('✅ Index settings_active_idx created');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runMigration()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
