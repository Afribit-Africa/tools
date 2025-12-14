/**
 * CBAF Test Data Seeder
 *
 * Creates comprehensive test data for Phase E testing:
 * - Economies with contact info
 * - BCEs for each economy
 * - Merchants with varied Lightning address states
 * - Videos with merchant appearances
 * - Monthly rankings
 */

import 'dotenv/config';
import { db } from '@/lib/db';
import {
  economies,
  users,
  merchants,
  videoSubmissions,
  videoMerchants,
  monthlyRankings
} from '@/lib/db/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

interface TestEconomy {
  name: string;
  contactEmail: string;
  bces: number;
  merchants: {
    verified: number;
    unverified: number;
    missing: number;
  };
}

const TEST_ECONOMIES: TestEconomy[] = [
  {
    name: 'Kibera Test Economy',
    contactEmail: 'kibera-test@afribit.com',
    bces: 2,
    merchants: { verified: 5, unverified: 3, missing: 2 }
  },
  {
    name: 'Mathare Test Economy',
    contactEmail: 'mathare-test@afribit.com',
    bces: 2,
    merchants: { verified: 4, unverified: 2, missing: 1 }
  },
  {
    name: 'Kawangware Test Economy',
    contactEmail: '', // Test case: no contact email
    bces: 1,
    merchants: { verified: 3, unverified: 1, missing: 0 }
  },
  {
    name: 'Mukuru Test Economy',
    contactEmail: 'mukuru-test@afribit.com',
    bces: 1,
    merchants: { verified: 6, unverified: 0, missing: 0 } // Test case: all verified
  },
  {
    name: 'Korogocho Test Economy',
    contactEmail: 'korogocho-test@afribit.com',
    bces: 1,
    merchants: { verified: 0, unverified: 0, missing: 5 } // Test case: no addresses at all
  }
];

const MERCHANT_NAMES = [
  { name: 'Mama Wanjiku\'s Shop', local: 'Duka la Mama Wanjiku' },
  { name: 'John\'s Barber Shop', local: 'Kinyozi ya John' },
  { name: 'Grace\'s Vegetable Stand', local: 'Mboga za Grace' },
  { name: 'Peter\'s Hardware', local: 'Biashara za Peter' },
  { name: 'Mary\'s Salon', local: 'Salon ya Mary' },
  { name: 'David\'s Electronics', local: 'Simu za David' },
  { name: 'Sarah\'s Bakery', local: 'Mkate wa Sarah' },
  { name: 'James\'s Butchery', local: 'Nyama za James' },
  { name: 'Lucy\'s Tailoring', local: 'Ushonaji wa Lucy' },
  { name: 'Michael\'s Fruits', local: 'Matunda ya Michael' }
];

const LIGHTNING_ADDRESSES = {
  blink: [
    'wanjiku@blink.sv',
    'john@blink.sv',
    'grace@blink.sv',
    'peter@blink.sv',
    'mary@blink.sv'
  ],
  fedi: [
    'david@fedi.xyz',
    'sarah@fedi.xyz',
    'james@fedi.xyz'
  ],
  machankura: [
    '+254712345678',
    '+254723456789',
    '+254734567890'
  ],
  invalid: [
    'invalid@invalid',
    'notanemail',
    'missing@provider.com'
  ]
};

async function clearTestData() {
  console.log('🧹 Clearing existing test data...');

  // Delete in order of foreign key dependencies
  await db.delete(videoMerchants);
  await db.delete(videoSubmissions).where(eq(videoSubmissions.videoTitle, 'TEST'));
  await db.delete(monthlyRankings);
  await db.delete(merchants);
  await db.delete(users).where(eq(users.email, 'test'));
  await db.delete(economies).where(eq(economies.name, 'Test'));

  console.log('✅ Test data cleared');
}

async function seedEconomies() {
  console.log('\n📍 Seeding test economies...');
  const economyIds: Record<string, string> = {};

  for (const testEconomy of TEST_ECONOMIES) {
    const [economy] = await db.insert(economies).values({
      name: testEconomy.name,
      slug: testEconomy.name.toLowerCase().replace(/\s+/g, '-'),
      description: `Test economy for Phase E testing - ${testEconomy.name}`,
      location: 'Nairobi, Kenya (Test)',
      contactEmail: testEconomy.contactEmail || null,
      isActive: true
    }).returning();

    economyIds[testEconomy.name] = economy.id;
    console.log(`  ✓ Created: ${testEconomy.name} (${economy.id})`);
  }

  return economyIds;
}

async function seedBCEs(economyIds: Record<string, string>) {
  console.log('\n👥 Seeding test BCEs...');
  const bceIds: string[] = [];
  const hashedPassword = await hash('test123', 12);

  let bceCounter = 1;
  for (const testEconomy of TEST_ECONOMIES) {
    const economyId = economyIds[testEconomy.name];

    for (let i = 0; i < testEconomy.bces; i++) {
      const [bce] = await db.insert(users).values({
        email: `bce${bceCounter}@test.afribit.com`,
        hashedPassword,
        role: 'bce',
        economyId,
        name: `Test BCE ${bceCounter}`,
        isActive: true
      }).returning();

      bceIds.push(bce.id);
      console.log(`  ✓ Created: ${bce.name} for ${testEconomy.name}`);
      bceCounter++;
    }
  }

  return bceIds;
}

async function seedMerchants(economyIds: Record<string, string>) {
  console.log('\n🏪 Seeding test merchants...');
  const merchantIds: Record<string, string[]> = {};

  let nameIndex = 0;
  let blinkIndex = 0;
  let fediIndex = 0;
  let machanIndex = 0;
  let invalidIndex = 0;

  for (const testEconomy of TEST_ECONOMIES) {
    const economyId = economyIds[testEconomy.name];
    merchantIds[testEconomy.name] = [];

    // Create verified merchants
    for (let i = 0; i < testEconomy.merchants.verified; i++) {
      const merchantName = MERCHANT_NAMES[nameIndex % MERCHANT_NAMES.length];
      const provider = i % 3 === 0 ? 'blink' : i % 3 === 1 ? 'fedi' : 'machankura';

      let address = '';
      if (provider === 'blink') {
        address = LIGHTNING_ADDRESSES.blink[blinkIndex % LIGHTNING_ADDRESSES.blink.length];
        blinkIndex++;
      } else if (provider === 'fedi') {
        address = LIGHTNING_ADDRESSES.fedi[fediIndex % LIGHTNING_ADDRESSES.fedi.length];
        fediIndex++;
      } else {
        address = LIGHTNING_ADDRESSES.machankura[machanIndex % LIGHTNING_ADDRESSES.machankura.length];
        machanIndex++;
      }

      const [merchant] = await db.insert(merchants).values({
        merchantName: `${merchantName.name} (Verified)`,
        localName: merchantName.local,
        economyId,
        lightningAddress: address,
        paymentProvider: provider,
        addressVerified: true,
        addressVerifiedAt: new Date('2025-12-01'),
        bio: `Test merchant with verified ${provider} address`
      }).returning();

      merchantIds[testEconomy.name].push(merchant.id);
      console.log(`  ✓ VERIFIED: ${merchant.merchantName} - ${address}`);
      nameIndex++;
    }

    // Create unverified merchants
    for (let i = 0; i < testEconomy.merchants.unverified; i++) {
      const merchantName = MERCHANT_NAMES[nameIndex % MERCHANT_NAMES.length];
      const address = LIGHTNING_ADDRESSES.invalid[invalidIndex % LIGHTNING_ADDRESSES.invalid.length];
      invalidIndex++;

      const [merchant] = await db.insert(merchants).values({
        merchantName: `${merchantName.name} (Unverified)`,
        localName: merchantName.local,
        economyId,
        lightningAddress: address,
        paymentProvider: 'other',
        addressVerified: false,
        addressVerifiedAt: null,
        bio: `Test merchant with unverified address`
      }).returning();

      merchantIds[testEconomy.name].push(merchant.id);
      console.log(`  ✓ UNVERIFIED: ${merchant.merchantName} - ${address}`);
      nameIndex++;
    }

    // Create merchants without addresses
    for (let i = 0; i < testEconomy.merchants.missing; i++) {
      const merchantName = MERCHANT_NAMES[nameIndex % MERCHANT_NAMES.length];

      const [merchant] = await db.insert(merchants).values({
        merchantName: `${merchantName.name} (No Address)`,
        localName: merchantName.local,
        economyId,
        lightningAddress: null,
        paymentProvider: null,
        addressVerified: null,
        addressVerifiedAt: null,
        bio: `Test merchant without Lightning address`
      }).returning();

      merchantIds[testEconomy.name].push(merchant.id);
      console.log(`  ✓ NO ADDRESS: ${merchant.merchantName}`);
      nameIndex++;
    }
  }

  return merchantIds;
}

async function seedVideos(
  bceIds: string[],
  economyIds: Record<string, string>,
  merchantIds: Record<string, string[]>
) {
  console.log('\n🎥 Seeding test videos...');

  const currentMonth = '2025-12';
  const videoIds: string[] = [];

  let videoCounter = 1;

  for (const testEconomy of TEST_ECONOMIES) {
    const economyId = economyIds[testEconomy.name];
    const economyMerchants = merchantIds[testEconomy.name];
    const economyBCEs = bceIds.filter(async (bceId) => {
      const [bce] = await db.select().from(users).where(eq(users.id, bceId));
      return bce.economyId === economyId;
    });

    // Create 3-5 videos per economy
    const videoCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < videoCount; i++) {
      const merchantsInVideo = Math.min(
        3 + Math.floor(Math.random() * 3),
        economyMerchants.length
      );

      const selectedMerchants = economyMerchants
        .sort(() => Math.random() - 0.5)
        .slice(0, merchantsInVideo);

      const [video] = await db.insert(videoSubmissions).values({
        economyId,
        submittedBy: economyBCEs[0] || bceIds[0],
        videoTitle: `TEST: ${testEconomy.name} Video ${videoCounter}`,
        videoUrl: `https://youtube.com/watch?v=test${videoCounter}`,
        submissionMonth: currentMonth,
        status: 'approved',
        reviewedBy: bceIds[0],
        reviewedAt: new Date('2025-12-10'),
        reviewNotes: 'Test video - auto-approved for testing'
      }).returning();

      // Link merchants to video
      for (const merchantId of selectedMerchants) {
        await db.insert(videoMerchants).values({
          videoId: video.id,
          merchantId
        });
      }

      videoIds.push(video.id);
      console.log(`  ✓ Video ${videoCounter}: ${video.videoTitle} (${merchantsInVideo} merchants)`);
      videoCounter++;
    }
  }

  return videoIds;
}

async function seedRankings(economyIds: Record<string, string>) {
  console.log('\n🏆 Seeding test rankings...');

  const currentMonth = '2025-12';
  const economies = Object.entries(economyIds);

  for (let i = 0; i < economies.length; i++) {
    const [economyName, economyId] = economies[i];

    // Calculate metrics based on test data structure
    const testEconomy = TEST_ECONOMIES.find(e => e.name === economyName)!;
    const totalMerchants =
      testEconomy.merchants.verified +
      testEconomy.merchants.unverified +
      testEconomy.merchants.missing;

    await db.insert(monthlyRankings).values({
      economyId,
      rankingPeriod: currentMonth,
      overallRank: i + 1,
      totalPoints: 100 - (i * 10),
      videosApproved: 3 + i,
      merchantsInvolved: totalMerchants,
      newMerchants: Math.floor(totalMerchants / 2),
      communityEngagement: 80 - (i * 5),
      videoQuality: 85 - (i * 5),
      merchantDiversity: 75 - (i * 5)
    });

    console.log(`  ✓ Rank #${i + 1}: ${economyName}`);
  }
}

async function main() {
  console.log('🚀 CBAF Test Data Seeder - Phase E\n');
  console.log('=====================================\n');

  try {
    // Step 1: Clear existing test data
    await clearTestData();

    // Step 2: Seed economies
    const economyIds = await seedEconomies();

    // Step 3: Seed BCEs
    const bceIds = await seedBCEs(economyIds);

    // Step 4: Seed merchants
    const merchantIds = await seedMerchants(economyIds);

    // Step 5: Seed videos
    await seedVideos(bceIds, economyIds, merchantIds);

    // Step 6: Seed rankings
    await seedRankings(economyIds);

    console.log('\n=====================================');
    console.log('✅ Test data seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   - ${TEST_ECONOMIES.length} economies`);
    console.log(`   - ${bceIds.length} BCEs`);
    console.log(`   - ${Object.values(merchantIds).flat().length} merchants`);
    console.log('   - ~20-25 videos');
    console.log('   - Current month rankings\n');
    console.log('🧪 Test Credentials:');
    console.log('   Email: bce1@test.afribit.com');
    console.log('   Password: test123\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
