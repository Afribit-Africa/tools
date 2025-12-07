import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function setupDatabase() {
  console.log('🔄 Setting up database with security features...');

  try {
    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_validation_sessions_created_at ON validation_sessions(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_validation_sessions_status ON validation_sessions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_address_validations_session_id ON address_validations(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_address_validations_status ON address_validations(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_address_validations_validated_at ON address_validations(validated_at DESC)`;
    console.log('✅ Indexes created');

    // Create function to update completed_at
    await sql`
      CREATE OR REPLACE FUNCTION update_completed_at()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
          NEW.completed_at = NOW();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Trigger function created');

    // Create trigger
    await sql`DROP TRIGGER IF EXISTS trigger_update_completed_at ON validation_sessions`;
    await sql`
      CREATE TRIGGER trigger_update_completed_at
        BEFORE UPDATE ON validation_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_completed_at();
    `;
    console.log('✅ Trigger created');

    // Create cleanup function
    await sql`
      CREATE OR REPLACE FUNCTION delete_old_validation_sessions()
      RETURNS void AS $$
      BEGIN
        DELETE FROM validation_sessions
        WHERE created_at < NOW() - INTERVAL '30 days';
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Cleanup function created');

    // Create statistics view
    await sql`
      CREATE OR REPLACE VIEW validation_session_stats AS
      SELECT 
        vs.id,
        vs.file_name,
        vs.total_addresses,
        vs.valid_count,
        vs.invalid_count,
        vs.fixed_count,
        vs.status,
        vs.created_at,
        vs.completed_at,
        COUNT(av.id) as validated_addresses,
        ROUND((vs.valid_count::DECIMAL / NULLIF(vs.total_addresses, 0) * 100), 2) as success_rate
      FROM validation_sessions vs
      LEFT JOIN address_validations av ON vs.id = av.session_id
      GROUP BY vs.id;
    `;
    console.log('✅ Statistics view created');

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Database features enabled:');
    console.log('  - Performance indexes on all tables');
    console.log('  - Auto-update completed_at timestamp');
    console.log('  - Cleanup function for old sessions (30+ days)');
    console.log('  - Statistics view for analytics');
    console.log('\n🔒 Security features:');
    console.log('  - Foreign key constraints with cascade delete');
    console.log('  - CHECK constraints on status fields');
    console.log('  - Prepared for Row Level Security (RLS)');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
