import { db } from '@/lib/db';
import {
  economies,
  merchants,
  videoSubmissions,
  videoMerchants,
  monthlyRankings,
  fundingDisbursements
} from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

async function verifyData() {
  console.log('\n🔍 CBAF Data Verification\n');
  console.log('='.repeat(60));

  try {
    // 1. Economies
    console.log('\n📊 ECONOMIES:');
    const economyData = await db.select().from(economies);
    console.log(`   Total: ${economyData.length}`);
    economyData.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.economyName} (${e.slug})`);
      console.log(`      Email: ${e.googleEmail}`);
      console.log(`      Videos Submitted: ${e.totalVideosSubmitted || 0}`);
      console.log(`      Videos Approved: ${e.totalVideosApproved || 0}`);
      console.log(`      Active: ${e.isActive ? 'Yes' : 'No'}`);
    });

    // 2. Merchants
    console.log('\n🏪 MERCHANTS:');
    const merchantData = await db.select().from(merchants);
    console.log(`   Total: ${merchantData.length}`);
    merchantData.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.merchantName || 'Unnamed'} (${m.localName || 'N/A'})`);
      console.log(`      BTCMap: ${m.btcmapUrl}`);
      console.log(`      Verified: ${m.btcmapVerified ? 'Yes' : 'No'}`);
      console.log(`      Times Appeared: ${m.timesAppearedInVideos || 0}`);
      console.log(`      First Appearance: ${m.firstAppearanceDate ? new Date(m.firstAppearanceDate).toLocaleDateString() : 'Never'}`);
      console.log(`      Last Appearance: ${m.lastAppearanceDate ? new Date(m.lastAppearanceDate).toLocaleDateString() : 'Never'}`);
    });

    // 3. Video Submissions
    console.log('\n🎥 VIDEO SUBMISSIONS:');
    const videoData = await db.select().from(videoSubmissions);
    console.log(`   Total: ${videoData.length}`);
    videoData.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.videoTitle || 'Untitled'}`);
      console.log(`      URL: ${v.videoUrl}`);
      console.log(`      Platform: ${v.platform}`);
      console.log(`      Status: ${v.status}`);
      console.log(`      Merchant Count: ${v.merchantCount || 0}`);
      console.log(`      Month: ${v.submissionMonth}`);
      console.log(`      Submitted: ${new Date(v.submittedAt).toLocaleString()}`);
      if (v.reviewedAt) {
        console.log(`      Reviewed: ${new Date(v.reviewedAt).toLocaleString()}`);
      }
    });

    // 4. Video-Merchant Links
    console.log('\n🔗 VIDEO-MERCHANT LINKS:');
    const linkData = await db
      .select({
        id: videoMerchants.id,
        videoId: videoMerchants.videoId,
        merchantId: videoMerchants.merchantId,
        isNewMerchant: videoMerchants.isNewMerchant,
        linkedAt: videoMerchants.linkedAt,
        videoTitle: videoSubmissions.videoTitle,
        merchantName: merchants.merchantName,
        localName: merchants.localName,
      })
      .from(videoMerchants)
      .leftJoin(videoSubmissions, sql`${videoMerchants.videoId} = ${videoSubmissions.id}`)
      .leftJoin(merchants, sql`${videoMerchants.merchantId} = ${merchants.id}`);

    console.log(`   Total Links: ${linkData.length}`);
    linkData.forEach((link, i) => {
      console.log(`   ${i + 1}. Video: "${link.videoTitle || 'Unknown'}" -> Merchant: "${link.merchantName || link.localName || 'Unknown'}"`);
      console.log(`      Is New Merchant: ${link.isNewMerchant ? 'Yes' : 'No'}`);
      console.log(`      Linked: ${link.linkedAt ? new Date(link.linkedAt).toLocaleString() : 'Unknown'}`);
    });

    // 5. Rankings
    console.log('\n🏆 MONTHLY RANKINGS:');
    const rankingData = await db.select().from(monthlyRankings);
    console.log(`   Total Rankings: ${rankingData.length}`);
    rankingData.forEach((r, i) => {
      console.log(`   ${i + 1}. Rank ${r.overallRank || 'N/A'} - ${r.month}`);
      console.log(`      Videos: ${r.videosApproved}, Merchants: ${r.merchantsTotal}, New: ${r.merchantsNew}`);
      console.log(`      Funding: ${r.fundingEarned} sats`);
    });

    // 6. Funding Disbursements
    console.log('\n💰 FUNDING DISBURSEMENTS:');
    const disbursementData = await db.select().from(fundingDisbursements);
    console.log(`   Total Disbursements: ${disbursementData.length}`);
    disbursementData.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.fundingMonth} - ${d.amountSats} sats`);
      console.log(`      Status: ${d.status}`);
      console.log(`      Payment: ${d.paymentMethod || 'N/A'}`);
    });

    // 7. Critical Relationship Checks
    console.log('\n✅ CRITICAL CHECKS:');

    // Check if videos have merchant links
    const videosWithoutLinks = await db
      .select({ id: videoSubmissions.id, title: videoSubmissions.videoTitle })
      .from(videoSubmissions)
      .leftJoin(videoMerchants, sql`${videoSubmissions.id} = ${videoMerchants.videoId}`)
      .where(sql`${videoMerchants.id} IS NULL AND ${videoSubmissions.merchantCount} > 0`);

    if (videosWithoutLinks.length > 0) {
      console.log(`   ⚠️  ${videosWithoutLinks.length} video(s) have merchantCount > 0 but no links!`);
      videosWithoutLinks.forEach(v => console.log(`      - ${v.title}`));
    } else {
      console.log('   ✅ All videos with merchants have proper links');
    }

    // Check if merchants have proper statistics
    const merchantsWithoutStats = await db
      .select({ id: merchants.id, name: merchants.merchantName })
      .from(merchants)
      .leftJoin(videoMerchants, sql`${merchants.id} = ${videoMerchants.merchantId}`)
      .where(sql`${videoMerchants.id} IS NOT NULL AND ${merchants.timesAppearedInVideos} = 0`);

    if (merchantsWithoutStats.length > 0) {
      console.log(`   ⚠️  ${merchantsWithoutStats.length} merchant(s) have links but timesAppearedInVideos = 0!`);
      merchantsWithoutStats.forEach(m => console.log(`      - ${m.name}`));
    } else {
      console.log('   ✅ All merchants with video links have proper statistics');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete\n');

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    process.exit(1);
  }
}

verifyData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
