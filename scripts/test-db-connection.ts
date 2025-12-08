import { db } from '@/lib/db';
import { economies, merchants, videoSubmissions, videoMerchants } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and schema...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('   ✅ Database connection successful\n');

    // Test 2: Check if tables exist
    console.log('2️⃣ Checking if CBAF tables exist...');
    
    const tables = [
      { name: 'economies', query: db.select().from(economies).limit(1) },
      { name: 'merchants', query: db.select().from(merchants).limit(1) },
      { name: 'video_submissions', query: db.select().from(videoSubmissions).limit(1) },
      { name: 'video_merchants', query: db.select().from(videoMerchants).limit(1) },
    ];

    for (const table of tables) {
      try {
        await table.query;
        console.log(`   ✅ Table "${table.name}" exists`);
      } catch (error) {
        console.log(`   ❌ Table "${table.name}" not found or error:`, error);
      }
    }

    console.log('\n3️⃣ Checking table counts...');
    
    const economyCount = await db.select({ count: sql<number>`count(*)` }).from(economies);
    const merchantCount = await db.select({ count: sql<number>`count(*)` }).from(merchants);
    const videoCount = await db.select({ count: sql<number>`count(*)` }).from(videoSubmissions);
    const linkCount = await db.select({ count: sql<number>`count(*)` }).from(videoMerchants);

    console.log(`   📊 Economies: ${economyCount[0].count}`);
    console.log(`   📊 Merchants: ${merchantCount[0].count}`);
    console.log(`   📊 Video Submissions: ${videoCount[0].count}`);
    console.log(`   📊 Video-Merchant Links: ${linkCount[0].count}`);

    console.log('\n✅ All database tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
