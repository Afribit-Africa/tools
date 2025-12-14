/**
 * Delete Test User Script
 *
 * Deletes all data for afribitkibera@gmail.com from the database
 * to allow restarting the registration process.
 *
 * Usage: npx tsx scripts/delete-test-user.ts
 */

import 'dotenv/config';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const TEST_EMAIL = 'afribitkibera@gmail.com';

async function deleteTestUser() {
  console.log(`\n🗑️  Deleting test user: ${TEST_EMAIL}\n`);

  try {
    // Find the economy
    const economy = await db.query.economies.findFirst({
      where: eq(economies.googleEmail, TEST_EMAIL),
    });

    if (!economy) {
      console.log('❌ No economy found for this email');
      return;
    }

    console.log(`Found economy: ${economy.economyName} (ID: ${economy.id})`);
    console.log(`Slug: ${economy.slug}`);
    console.log(`Created: ${economy.createdAt}`);

    // Delete the economy (CASCADE will delete related data)
    // This will automatically delete:
    // - merchants (via economyId foreign key)
    // - videoSubmissions (via economyId foreign key)
    // - videoMerchants (via video deletion cascade)
    // - fundingDisbursements (via economyId foreign key)
    // - monthlyRankings (via economyId foreign key)

    console.log('\n🔄 Deleting economy and all related data...');

    const result = await db
      .delete(economies)
      .where(eq(economies.googleEmail, TEST_EMAIL))
      .returning();

    if (result.length > 0) {
      console.log('\n✅ Successfully deleted:');
      console.log(`   - Economy: ${result[0].economyName}`);
      console.log(`   - All merchants registered by this economy`);
      console.log(`   - All video submissions by this economy`);
      console.log(`   - All video-merchant links`);
      console.log(`   - All funding disbursements`);
      console.log(`   - All monthly rankings`);
      console.log('\n✨ The user can now restart registration from scratch');
    } else {
      console.log('\n❌ Failed to delete economy');
    }

  } catch (error) {
    console.error('\n❌ Error deleting test user:', error);
    throw error;
  }
}

// Run the script
deleteTestUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
