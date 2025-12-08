# CBAF Management System - Implementation Plan
**Circular Bitcoin Africa Fund - Proof of Work & Funding Platform**

---

## 🎯 Executive Summary

Build a comprehensive management platform for the Circular Bitcoin Africa Fund (CBAF) that:
- Enables circular economies to submit Proof of Work videos
- Tracks merchant engagement via BTCMap integration
- Provides admin workflow for video verification
- Offers analytics and rankings across economies
- Facilitates bulk Lightning payments via Fastlight integration
- Replaces manual spreadsheet and Telegram-based workflows

**Target Users:** 33+ Bitcoin Circular Economies across Africa

---

## 📊 Current Workflow (Problems)

### The Spreadsheet Problem
```
1. BCE posts video link in Telegram group
   ↓
2. Admin manually copies link to Google Sheets
   ↓
3. Admin watches video to verify legitimacy
   ↓
4. Admin manually moves approved videos to "Approved" column
   ↓
5. At month end, admin counts videos per BCE
   ↓
6. Admin calculates funding allocation manually
   ↓
7. Admin sends payments individually (time-consuming)
```

**Pain Points:**
- ❌ Manual data entry from Telegram to spreadsheet
- ❌ No structured merchant tracking (BTCMap links scattered)
- ❌ Hard to distinguish new merchants vs returning merchants
- ❌ No automated analytics or rankings
- ❌ Time-consuming approval workflow
- ❌ Manual payment processing at month end
- ❌ Difficult to audit historical Proof of Work
- ❌ No way to track merchant growth over time

---

## 🚀 Proposed Solution

### New Workflow (Automated)
```
1. BCE logs in via Google OAuth
   ↓
2. BCE creates their economy profile (one-time)
   ↓
3. BCE registers merchants on their profile (BTCMap links)
   ↓
4. BCE submits video with auto-suggested merchants
   ↓
5. Admin receives notification → reviews video
   ↓
6. Admin approves/rejects with comments
   ↓
7. System auto-tracks: videos, merchants, rankings
   ↓
8. At month end: Auto-generated report + bulk payment via Fastlight
```

**Benefits:**
- ✅ Zero manual data entry
- ✅ Structured merchant database with BTCMap integration
- ✅ Automatic detection of new vs returning merchants
- ✅ Real-time analytics and leaderboards
- ✅ Streamlined approval workflow with comments
- ✅ One-click bulk payments via Fastlight
- ✅ Complete audit trail and historical data
- ✅ Merchant growth tracking and insights

---

## 🏗️ System Architecture

### User Roles

#### 1. **BCE (Bitcoin Circular Economy)** - Base Role
**Access:** Own dashboard only

**Capabilities:**
- ✅ Create/edit economy profile
- ✅ Register merchants (BTCMap links)
- ✅ Submit Proof of Work videos
- ✅ Add merchant tags to video submissions
- ✅ View own submission history
- ✅ See approval status and admin comments
- ✅ View own statistics (videos, merchants, ranking)
- ✅ Track payment history received from CBAF

#### 2. **Admin** - Review & Approve
**Access:** All BCE submissions

**Capabilities:**
- ✅ View all pending video submissions
- ✅ Watch videos and verify legitimacy
- ✅ Approve or reject videos with comments
- ✅ View merchant details for each video
- ✅ See analytics across all economies
- ✅ Generate monthly reports
- ❌ Cannot send payments (Super Admin only)
- ❌ Cannot delete economies or users

#### 3. **Super Admin** - Full Control
**Access:** Everything

**Capabilities:**
- ✅ All Admin capabilities
- ✅ Send bulk Lightning payments via Fastlight
- ✅ Configure funding rules and allocation
- ✅ Manage admin accounts
- ✅ Delete/archive economies or submissions
- ✅ Export data and reports
- ✅ System settings and configuration
- ✅ View financial overview and payment history

---

## 📊 Database Schema

### Core Tables

#### 1. `economies` Table
Store Bitcoin Circular Economy profiles.

```typescript
export const economies = pgTable('economies', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Google OAuth
  googleId: text('google_id').notNull().unique(),
  googleEmail: text('google_email').notNull(),
  googleName: text('google_name'),
  googleAvatar: text('google_avatar'),

  // Economy Profile
  economyName: text('economy_name').notNull(), // "Bitcoin Ekasi"
  slug: text('slug').notNull().unique(), // "bitcoin-ekasi"
  country: text('country').notNull(), // "South Africa"
  city: text('city'),
  description: text('description'),

  // Contact Info
  website: text('website'),
  twitter: text('twitter'),
  telegram: text('telegram'),

  // Location (for map display)
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),

  // Payment Details
  lightningAddress: text('lightning_address'), // For receiving CBAF funding
  lnurlPay: text('lnurl_pay'),
  onchainAddress: text('onchain_address'),

  // Membership
  joinedCBAFAt: timestamp('joined_cbaf_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false), // Verified by CBAF admins

  // Statistics (cached for performance)
  totalVideosSubmitted: integer('total_videos_submitted').default(0),
  totalVideosApproved: integer('total_videos_approved').default(0),
  totalMerchantsRegistered: integer('total_merchants_registered').default(0),
  totalFundingReceived: bigint('total_funding_received', { mode: 'number' }).default(0), // sats

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at'),
}, (table) => ({
  googleIdIdx: index('economy_google_id_idx').on(table.googleId),
  slugIdx: index('economy_slug_idx').on(table.slug),
  activeIdx: index('economy_active_idx').on(table.isActive),
}));
```

#### 2. `merchants` Table
Store registered merchants (BTCMap links).

```typescript
export const merchants = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Ownership
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  // BTCMap Integration
  btcmapUrl: text('btcmap_url').notNull(), // "https://btcmap.org/merchant/12345"
  osmNodeId: text('osm_node_id'), // Extracted from BTCMap URL

  // Merchant Details (fetched from BTCMap API)
  merchantName: text('merchant_name'),
  category: text('category'), // restaurant, shop, etc.
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  address: text('address'),

  // Custom Details (from BCE)
  localName: text('local_name'), // Local name if different
  notes: text('notes'), // BCE can add context

  // Verification Status
  btcmapVerified: boolean('btcmap_verified').default(false), // Checked against BTCMap API
  lastVerifiedAt: timestamp('last_verified_at'),
  verificationError: text('verification_error'),

  // Usage Statistics
  timesAppearInVideos: integer('times_appear_in_videos').default(0),
  firstAppearanceDate: timestamp('first_appearance_date'),
  lastAppearanceDate: timestamp('last_appearance_date'),

  // Status
  isActive: boolean('is_active').default(true),

  // Timestamps
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  economyIdx: index('merchant_economy_idx').on(table.economyId),
  btcmapIdx: index('merchant_btcmap_idx').on(table.btcmapUrl),
  osmIdx: index('merchant_osm_idx').on(table.osmNodeId),
}));
```

#### 3. `video_submissions` Table
Store Proof of Work video submissions.

```typescript
export const videoSubmissions = pgTable('video_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Ownership
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  // Video Details
  videoUrl: text('video_url').notNull(), // YouTube, Twitter, TikTok, etc.
  videoTitle: text('video_title'),
  videoDescription: text('video_description'),
  videoDuration: integer('video_duration'), // seconds
  videoThumbnail: text('video_thumbnail'),

  // Metadata extraction
  platform: text('platform').$type<'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'other'>(),
  videoId: text('video_id'), // Platform-specific ID

  // Month/Period Tracking
  submissionMonth: text('submission_month').notNull(), // "2025-12" for December 2025
  submissionYear: integer('submission_year').notNull(), // 2025

  // Review Status
  status: text('status')
    .notNull()
    .$type<'pending' | 'approved' | 'rejected' | 'flagged'>()
    .default('pending'),

  // Admin Review
  reviewedBy: text('reviewed_by'), // Admin email
  reviewedAt: timestamp('reviewed_at'),
  adminComments: text('admin_comments'),
  rejectionReason: text('rejection_reason'),

  // Merchant Association Count
  merchantCount: integer('merchant_count').default(0),
  newMerchantCount: integer('new_merchant_count').default(0), // First-time merchants
  returningMerchantCount: integer('returning_merchant_count').default(0),

  // Funding Impact
  fundingEarned: bigint('funding_earned', { mode: 'number' }).default(0), // sats

  // Timestamps
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  economyIdx: index('video_economy_idx').on(table.economyId),
  statusIdx: index('video_status_idx').on(table.status),
  monthIdx: index('video_month_idx').on(table.submissionMonth),
  yearIdx: index('video_year_idx').on(table.submissionYear),
}));
```

#### 4. `video_merchants` Table
Junction table: Link videos to merchants.

```typescript
export const videoMerchants = pgTable('video_merchants', {
  id: uuid('id').primaryKey().defaultRandom(),

  videoId: uuid('video_id')
    .references(() => videoSubmissions.id, { onDelete: 'cascade' })
    .notNull(),

  merchantId: uuid('merchant_id')
    .references(() => merchants.id, { onDelete: 'cascade' })
    .notNull(),

  // Context
  isNewMerchant: boolean('is_new_merchant').default(false), // First appearance in ANY video
  merchantRole: text('merchant_role'), // "sender" or "receiver" or "both"
  notes: text('notes'), // BCE can note merchant's role in video

  // Timestamps
  linkedAt: timestamp('linked_at').defaultNow().notNull(),
}, (table) => ({
  videoIdx: index('vm_video_idx').on(table.videoId),
  merchantIdx: index('vm_merchant_idx').on(table.merchantId),
  uniqueLink: index('vm_unique_idx').on(table.videoId, table.merchantId).unique(),
}));
```

#### 5. `admin_users` Table
Store admin and super admin accounts.

```typescript
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Google OAuth
  googleId: text('google_id').notNull().unique(),
  googleEmail: text('google_email').notNull().unique(),
  googleName: text('google_name'),
  googleAvatar: text('google_avatar'),

  // Role
  role: text('role')
    .notNull()
    .$type<'admin' | 'super_admin'>()
    .default('admin'),

  // Permissions
  canApproveVideos: boolean('can_approve_videos').default(true),
  canRejectVideos: boolean('can_reject_videos').default(true),
  canSendPayments: boolean('can_send_payments').default(false), // Super admin only
  canManageAdmins: boolean('can_manage_admins').default(false), // Super admin only

  // Activity
  lastLoginAt: timestamp('last_login_at'),
  videosReviewedCount: integer('videos_reviewed_count').default(0),

  // Status
  isActive: boolean('is_active').default(true),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  googleIdIdx: index('admin_google_id_idx').on(table.googleId),
  emailIdx: index('admin_email_idx').on(table.googleEmail),
  roleIdx: index('admin_role_idx').on(table.role),
}));
```

#### 6. `funding_disbursements` Table
Track all payments sent to economies.

```typescript
export const fundingDisbursements = pgTable('funding_disbursements', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Payment Details
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  amountSats: bigint('amount_sats', { mode: 'number' }).notNull(),
  amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }), // USD equivalent

  // Period
  fundingMonth: text('funding_month').notNull(), // "2025-12"
  fundingYear: integer('funding_year').notNull(),

  // Metrics that earned this funding
  videosApproved: integer('videos_approved').default(0),
  merchantsInvolved: integer('merchants_involved').default(0),
  newMerchants: integer('new_merchants').default(0),

  // Payment Info
  paymentMethod: text('payment_method').$type<'lightning' | 'onchain' | 'manual'>(),
  lightningInvoice: text('lightning_invoice'),
  paymentHash: text('payment_hash'),
  transactionId: text('transaction_id'),

  // Status
  status: text('status')
    .notNull()
    .$type<'pending' | 'processing' | 'completed' | 'failed'>()
    .default('pending'),

  errorMessage: text('error_message'),

  // Admin
  initiatedBy: text('initiated_by').notNull(), // Super admin email
  approvedBy: text('approved_by'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  economyIdx: index('funding_economy_idx').on(table.economyId),
  monthIdx: index('funding_month_idx').on(table.fundingMonth),
  statusIdx: index('funding_status_idx').on(table.status),
}));
```

#### 7. `monthly_rankings` Table
Pre-calculated monthly rankings for performance.

```typescript
export const monthlyRankings = pgTable('monthly_rankings', {
  id: uuid('id').primaryKey().defaultRandom(),

  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  // Period
  month: text('month').notNull(), // "2025-12"
  year: integer('year').notNull(),

  // Metrics
  videosSubmitted: integer('videos_submitted').default(0),
  videosApproved: integer('videos_approved').default(0),
  videosRejected: integer('videos_rejected').default(0),
  approvalRate: numeric('approval_rate', { precision: 5, scale: 2 }), // percentage

  merchantsTotal: integer('merchants_total').default(0),
  merchantsNew: integer('merchants_new').default(0),
  merchantsReturning: integer('merchants_returning').default(0),

  // Rankings
  rankByVideos: integer('rank_by_videos'),
  rankByMerchants: integer('rank_by_merchants'),
  rankByNewMerchants: integer('rank_by_new_merchants'),
  overallRank: integer('overall_rank'),

  // Funding
  fundingEarned: bigint('funding_earned', { mode: 'number' }).default(0),

  // Timestamps
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
}, (table) => ({
  economyMonthIdx: index('ranking_economy_month_idx').on(table.economyId, table.month),
  monthIdx: index('ranking_month_idx').on(table.month),
  overallRankIdx: index('ranking_overall_idx').on(table.overallRank),
}));
```

---

## 🎨 User Interface Design

### BCE Dashboard Pages

#### 1. **`/dashboard/bce`** - BCE Home Dashboard
**Components:**
- Welcome header with economy name and logo
- Quick stats cards:
  - Videos submitted this month
  - Videos approved this month
  - Total merchants registered
  - Current month ranking
- Recent activity feed
- Quick action buttons:
  - Submit New Video
  - Register Merchant
  - View Statistics

#### 2. **`/dashboard/bce/videos`** - Video Submissions
**Features:**
- List of all video submissions
- Filter by month, status (pending/approved/rejected)
- Each video card shows:
  - Thumbnail
  - Title & description
  - Submission date
  - Status badge
  - Merchant count
  - Admin comments (if any)
- "Submit New Video" button (opens modal)

**Submit Video Modal:**
```
┌─────────────────────────────────────────────┐
│  Submit Proof of Work Video                 │
├─────────────────────────────────────────────┤
│                                             │
│  Video URL *                                │
│  [https://youtube.com/...              ]   │
│                                             │
│  Title (optional)                           │
│  [                                      ]   │
│                                             │
│  Description (optional)                     │
│  [                                      ]   │
│                                             │
│  Merchants in this video *                  │
│  ┌─────────────────────────────────────┐   │
│  │ ✓ Mama Sarah's Shop                 │   │
│  │ ✓ Bitcoin Barber                    │   │
│  │ ○ Tuck Shop #5                      │   │
│  │ ○ Fish Market                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  + Register New Merchant                    │
│                                             │
│  [Cancel]              [Submit Video]       │
└─────────────────────────────────────────────┘
```

#### 3. **`/dashboard/bce/merchants`** - Merchant Management
**Features:**
- List of all registered merchants
- Search and filter
- Each merchant card shows:
  - Merchant name
  - BTCMap link (clickable)
  - Category
  - Times appeared in videos
  - First/last appearance dates
  - Status indicator (verified on BTCMap)
- "Register New Merchant" button (opens modal)

**Register Merchant Modal:**
```
┌─────────────────────────────────────────────┐
│  Register Merchant                          │
├─────────────────────────────────────────────┤
│                                             │
│  BTCMap URL *                               │
│  [https://btcmap.org/merchant/...      ]   │
│  [Verify BTCMap Link]                       │
│                                             │
│  ✓ Merchant verified on BTCMap!             │
│  Name: Mama Sarah's Shop                    │
│  Category: Restaurant                       │
│  Location: Mossel Bay, South Africa         │
│                                             │
│  Local Name (optional)                      │
│  [                                      ]   │
│                                             │
│  Notes (optional)                           │
│  [                                      ]   │
│                                             │
│  [Cancel]              [Register]           │
└─────────────────────────────────────────────┘
```

#### 4. **`/dashboard/bce/profile`** - Economy Profile
**Sections:**
- Economy information (editable)
- Contact details
- Payment information (Lightning address)
- Membership status
- Statistics overview

#### 5. **`/dashboard/bce/stats`** - Statistics & Rankings
**Features:**
- Monthly performance charts
- Comparison with other economies (anonymized)
- Merchant growth over time
- Video approval trends
- Funding history

---

### Admin Dashboard Pages

#### 1. **`/dashboard/admin`** - Admin Home
**Components:**
- Pending reviews counter (highlighted)
- System-wide stats:
  - Total economies
  - Videos pending review
  - Videos reviewed this month
  - Total merchants registered
- Recent submissions feed
- Quick filters:
  - All Pending
  - Flagged for Review
  - Recently Approved
  - Recently Rejected

#### 2. **`/dashboard/admin/reviews`** - Video Review Queue
**Features:**
- Card view of pending videos
- Each card shows:
  - Economy name & logo
  - Video embed (YouTube/Twitter player)
  - Submission date
  - Merchants involved (clickable to see BTCMap)
  - Action buttons: Approve / Reject / Flag
- Side panel:
  - Economy stats
  - Previous submissions from this economy
  - Merchant verification status

**Review Flow:**
```
┌───────────────────────────────────────────────────────────┐
│  Bitcoin Ekasi                                    [PENDING]│
├───────────────────────────────────────────────────────────┤
│  📹 Video Player                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │          [YouTube Embed]                           │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  Submitted: Dec 7, 2025, 2:30 PM                          │
│  Duration: 2:45                                            │
│                                                            │
│  Merchants in Video (3):                                  │
│  ├─ ✓ Mama Sarah's Shop        [BTCMap ↗]                 │
│  ├─ ✓ Bitcoin Barber           [BTCMap ↗]                 │
│  └─ ✓ Fish Market              [BTCMap ↗]  🆕 NEW         │
│                                                            │
│  Comments (optional):                                     │
│  [                                                    ]    │
│                                                            │
│  [❌ Reject]  [🚩 Flag]  [✅ Approve]                      │
└───────────────────────────────────────────────────────────┘
```

#### 3. **`/dashboard/admin/economies`** - Economy Management
**Features:**
- List of all registered economies
- Search and filter
- View economy details
- See submission history
- Export economy data

#### 4. **`/dashboard/admin/analytics`** - System Analytics
**Features:**
- Global statistics dashboard
- Monthly trends (videos, merchants, economies)
- Top performing economies
- Merchant distribution by country
- Video approval rates
- Export reports (PDF, CSV)

---

### Super Admin Pages

#### 1. **`/dashboard/super-admin/funding`** - Funding Management
**Features:**
- Monthly funding calculator
- View eligible economies for current month
- Metrics:
  - Videos approved per economy
  - Merchants involved
  - New merchants added
- Suggested funding allocation (configurable formula)
- Bulk payment interface with Fastlight integration

**Funding Flow:**
```
┌─────────────────────────────────────────────┐
│  December 2025 Funding Round                │
├─────────────────────────────────────────────┤
│  Total Available: 50,000,000 sats           │
│  Economies Eligible: 28                     │
│                                             │
│  Funding Formula:                           │
│  Base: 500k sats + Video Bonus + Merchant   │
│  Bonus                                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Economy          Videos  Funding    │   │
│  ├─────────────────────────────────────┤   │
│  │ Bitcoin Ekasi     45    2.5M sats ✓ │   │
│  │ Afribit Kibera    38    2.2M sats ✓ │   │
│  │ Bitcoin Dua       32    1.9M sats ✓ │   │
│  │ ...                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Export CSV]  [Send via Fastlight]         │
└─────────────────────────────────────────────┘
```

#### 2. **`/dashboard/super-admin/payments`** - Payment History
**Features:**
- All disbursements history
- Filter by month, economy, status
- Payment details and transaction IDs
- Failed payment tracking
- Export financial reports

#### 3. **`/dashboard/super-admin/settings`** - System Settings
**Features:**
- Manage admin accounts
- Configure funding formulas
- Set approval thresholds
- System maintenance

---

## 🔐 Authentication & Authorization

### Google OAuth Implementation

**Why Google?**
- CBAF admins already use Google Workspace
- Most BCE leaders have Gmail accounts
- Simple, secure, no password management
- Profile pictures and names auto-populated

**OAuth Flow:**
```typescript
// lib/auth/google-oauth.ts
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    emailVerified: payload.email_verified,
  };
}
```

**Session Management:**
- Use Next.js middleware for route protection
- JWT tokens stored in HTTP-only cookies
- Token refresh on expiry
- Role-based access control

**Protected Routes:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('cbaf_session');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const decoded = verifyToken(token.value);

  // Check role-based access
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard/super-admin')) {
    if (decoded.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## 🔗 BTCMap Integration

### Merchant Verification

When BCE registers a merchant, system must verify the BTCMap link:

```typescript
// lib/btcmap/verify-merchant.ts
export async function verifyBTCMapMerchant(btcmapUrl: string) {
  // Extract OSM node ID from URL
  // https://btcmap.org/merchant/12345678 → 12345678
  const osmNodeId = extractOSMNodeId(btcmapUrl);

  if (!osmNodeId) {
    return {
      verified: false,
      error: 'Invalid BTCMap URL format',
    };
  }

  // Query BTCMap API
  const response = await fetch(
    `https://api.btcmap.org/v2/elements?osm_json.id=${osmNodeId}`
  );

  if (!response.ok) {
    return {
      verified: false,
      error: 'BTCMap API error',
    };
  }

  const data = await response.json();

  if (!data.elements || data.elements.length === 0) {
    return {
      verified: false,
      error: 'Merchant not found on BTCMap',
    };
  }

  const merchant = data.elements[0];

  return {
    verified: true,
    osmNodeId,
    name: merchant.osm_json.tags.name,
    category: merchant.osm_json.tags.amenity || merchant.osm_json.tags.shop,
    latitude: merchant.osm_json.lat,
    longitude: merchant.osm_json.lon,
    address: merchant.osm_json.tags['addr:full'],
    tags: merchant.tags,
  };
}
```

### Auto-Complete Merchant List

When BCE submits a video, suggest registered merchants:

```typescript
// Smart merchant suggestions based on:
// 1. Recently registered merchants
// 2. Merchants not in recent videos (encourage diversity)
// 3. Merchants from same economy

async function suggestMerchants(economyId: string, limit: number = 10) {
  return await db.query.merchants.findMany({
    where: and(
      eq(merchants.economyId, economyId),
      eq(merchants.isActive, true)
    ),
    orderBy: [
      desc(merchants.registeredAt), // Recent first
      asc(merchants.timesAppearInVideos), // Less featured first
    ],
    limit,
  });
}
```

---

## 📊 Analytics & Rankings

### Monthly Ranking Algorithm

```typescript
// lib/analytics/calculate-rankings.ts
export async function calculateMonthlyRankings(month: string, year: number) {
  // 1. Get all economies
  const economies = await db.query.economies.findMany({
    where: eq(economies.isActive, true),
  });

  // 2. Calculate metrics for each economy
  const metrics = await Promise.all(
    economies.map(async (economy) => {
      const videosSubmitted = await db.query.videoSubmissions.findMany({
        where: and(
          eq(videoSubmissions.economyId, economy.id),
          eq(videoSubmissions.submissionMonth, month)
        ),
      });

      const videosApproved = videosSubmitted.filter(
        (v) => v.status === 'approved'
      );

      const merchantsInvolved = await db
        .select({ merchantId: videoMerchants.merchantId })
        .from(videoMerchants)
        .innerJoin(
          videoSubmissions,
          eq(videoMerchants.videoId, videoSubmissions.id)
        )
        .where(
          and(
            eq(videoSubmissions.economyId, economy.id),
            eq(videoSubmissions.submissionMonth, month),
            eq(videoSubmissions.status, 'approved')
          )
        )
        .groupBy(videoMerchants.merchantId);

      const newMerchants = await db.query.videoMerchants.findMany({
        where: and(
          eq(videoMerchants.isNewMerchant, true),
          // ... filter by month and economy
        ),
      });

      return {
        economyId: economy.id,
        videosSubmitted: videosSubmitted.length,
        videosApproved: videosApproved.length,
        approvalRate:
          videosSubmitted.length > 0
            ? (videosApproved.length / videosSubmitted.length) * 100
            : 0,
        merchantsTotal: merchantsInvolved.length,
        merchantsNew: newMerchants.length,
      };
    })
  );

  // 3. Calculate rankings
  // Sort by videos approved (descending)
  const sortedByVideos = [...metrics].sort(
    (a, b) => b.videosApproved - a.videosApproved
  );

  sortedByVideos.forEach((metric, index) => {
    metric.rankByVideos = index + 1;
  });

  // Sort by merchants involved
  const sortedByMerchants = [...metrics].sort(
    (a, b) => b.merchantsTotal - a.merchantsTotal
  );

  sortedByMerchants.forEach((metric, index) => {
    metric.rankByMerchants = index + 1;
  });

  // Calculate overall rank (weighted average)
  metrics.forEach((metric) => {
    metric.overallRank = Math.round(
      (metric.rankByVideos * 0.6 + metric.rankByMerchants * 0.4)
    );
  });

  // 4. Save to database
  await Promise.all(
    metrics.map((metric) =>
      db.insert(monthlyRankings).values({
        economyId: metric.economyId,
        month,
        year,
        videosSubmitted: metric.videosSubmitted,
        videosApproved: metric.videosApproved,
        approvalRate: metric.approvalRate.toString(),
        merchantsTotal: metric.merchantsTotal,
        merchantsNew: metric.merchantsNew,
        rankByVideos: metric.rankByVideos,
        rankByMerchants: metric.rankByMerchants,
        overallRank: metric.overallRank,
      })
    )
  );

  return metrics;
}
```

### Leaderboard Display

```typescript
// Monthly leaderboard with filters
<Leaderboard month="2025-12" sortBy="overall" />

// Components show:
// - Rank position with trend (↑ up, ↓ down, - same)
// - Economy name and logo
// - Videos approved
// - Merchants involved
// - New merchants this month
// - Approval rate
```

---

## 💸 Fastlight Integration

### Payment Flow

**Bulk Payment Process:**

1. Super admin reviews monthly rankings
2. Calculates funding allocation per economy
3. Exports CSV with Lightning addresses and amounts
4. Imports CSV into Fastlight module
5. Fastlight validates all addresses
6. Sends bulk Lightning payments
7. System records payment hashes and status

**Integration Points:**

```typescript
// app/api/funding/send-bulk/route.ts
export async function POST(request: Request) {
  // 1. Verify super admin
  const session = await getSession(request);
  if (session.role !== 'super_admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // 2. Get funding data
  const { month, year, disbursements } = await request.json();

  // 3. Prepare Fastlight batch
  const batch = disbursements.map((d) => ({
    lightningAddress: d.lightningAddress,
    amountSats: d.amountSats,
    memo: `CBAF Funding - ${month}`,
  }));

  // 4. Call Fastlight API
  const result = await sendBulkPayments(batch);

  // 5. Record disbursements
  await Promise.all(
    result.payments.map(async (payment, index) => {
      await db.insert(fundingDisbursements).values({
        economyId: disbursements[index].economyId,
        amountSats: disbursements[index].amountSats,
        fundingMonth: month,
        fundingYear: year,
        paymentMethod: 'lightning',
        paymentHash: payment.paymentHash,
        status: payment.success ? 'completed' : 'failed',
        errorMessage: payment.error,
        initiatedBy: session.email,
      });
    })
  );

  return Response.json({ success: true, result });
}
```

**Fastlight Module Reuse:**
- Use existing validation engine
- Reuse Lightning payment logic
- Leverage batch payment UI
- Import CSV format from existing module

---

## 📱 Additional Features

### Video Metadata Extraction

Auto-extract video details when BCE pastes URL:

```typescript
// lib/video/extract-metadata.ts
export async function extractVideoMetadata(url: string) {
  // Detect platform
  const platform = detectPlatform(url);

  switch (platform) {
    case 'youtube':
      return await extractYouTubeMetadata(url);
    case 'twitter':
      return await extractTwitterMetadata(url);
    case 'tiktok':
      return await extractTikTokMetadata(url);
    default:
      return { platform: 'other', url };
  }
}

async function extractYouTubeMetadata(url: string) {
  // Use YouTube Data API
  const videoId = extractYouTubeId(url);
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`
  );

  const data = await response.json();
  const video = data.items[0];

  return {
    platform: 'youtube',
    videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails.high.url,
    duration: parseDuration(video.contentDetails.duration),
  };
}
```

### Notification System

**Email Notifications:**
- BCE: Video approved/rejected
- Admin: New video submitted
- Super Admin: Monthly funding summary ready

**In-App Notifications:**
- Real-time badge counter
- Toast notifications for status changes
- Activity feed on dashboard

### Export & Reporting

**Monthly Report Generator:**
```typescript
// Generate PDF report with:
// - Total videos submitted/approved
// - Top 10 economies by videos
// - Top 10 economies by merchants
// - New merchants added
// - Total funding distributed
// - Charts and graphs
```

**CSV Exports:**
- All videos for a month
- All merchants for an economy
- Payment history
- Economy statistics

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Set up database schema with Drizzle
- ✅ Implement Google OAuth
- ✅ Create role-based middleware
- ✅ Build basic UI layouts

### Phase 2: BCE Dashboard (Week 3-4)
- ✅ Economy profile creation/editing
- ✅ Merchant registration with BTCMap verification
- ✅ Video submission form
- ✅ Video history view

### Phase 3: Admin Dashboard (Week 5-6)
- ✅ Video review interface
- ✅ Approve/reject workflow with comments
- ✅ Economy management
- ✅ Basic analytics

### Phase 4: Analytics & Rankings (Week 7)
- ✅ Monthly ranking calculator
- ✅ Leaderboard display
- ✅ Statistics dashboard
- ✅ Charts and graphs

### Phase 5: Funding System (Week 8)
- ✅ Funding calculator
- ✅ Fastlight integration for bulk payments
- ✅ Payment history tracking
- ✅ Disbursement records

### Phase 6: Polish & Launch (Week 9-10)
- ✅ Email notifications
- ✅ Video metadata extraction
- ✅ Export/reporting features
- ✅ Mobile responsive design
- ✅ User documentation
- ✅ Testing and bug fixes

---

## 📊 Success Metrics

### Key Performance Indicators

**For BCEs:**
- Time to submit video: < 2 minutes
- Time to register merchant: < 1 minute
- Approval notification: < 24 hours

**For Admins:**
- Review time per video: < 3 minutes
- Merchant verification: Instant (BTCMap API)
- Monthly report generation: < 5 minutes

**For Super Admins:**
- Bulk payment processing: < 10 minutes for 30+ economies
- Payment success rate: > 98%
- System uptime: > 99.5%

**System-Wide:**
- Replace spreadsheet: 100% migration by Month 2
- Reduce admin workload: 70% time savings
- Merchant tracking accuracy: 100%
- Payment automation: 90% automated

---

## 🔒 Security Considerations

1. **Authentication:**
   - Google OAuth 2.0 only
   - No password storage
   - JWT with short expiry (1 hour)
   - HTTP-only cookies

2. **Authorization:**
   - Role-based access control
   - Middleware protection on all routes
   - API endpoint role validation

3. **Data Privacy:**
   - Economy data visible only to owners + admins
   - Payment info encrypted at rest
   - No PII shared across economies

4. **Rate Limiting:**
   - Video submissions: 10 per hour per BCE
   - Merchant registrations: 20 per hour per BCE
   - API calls: 100 per minute per user

5. **Audit Trail:**
   - Log all admin actions
   - Track video approvals/rejections
   - Record payment transactions
   - Monitor suspicious activity

---

## 🌍 Future Enhancements

### Phase 2 Features (3-6 months)

1. **Mobile App:**
   - Native iOS/Android apps
   - Quick video uploads from phone
   - Push notifications

2. **Advanced Analytics:**
   - Merchant growth predictions
   - Video engagement metrics
   - Economy health scores
   - Comparative analysis tools

3. **Merchant Portal:**
   - Let merchants claim their profiles
   - Add photos and hours
   - Track appearance in videos
   - Receive tips directly

4. **Automated Video Analysis:**
   - AI detection of Bitcoin transactions in videos
   - Auto-tag merchants from video content
   - Fraud detection (duplicate videos)

5. **Integration APIs:**
   - Public API for economy stats
   - Webhook notifications
   - Third-party integrations

6. **Gamification:**
   - BCE badges and achievements
   - Merchant streaks (consecutive months)
   - Community challenges
   - Public leaderboards with opt-in

---

## 📚 Technical Stack

### Frontend
- **Next.js 14** (already in use)
- **React** with TypeScript
- **Tailwind CSS** (existing styles)
- **Shadcn/ui** components
- **TanStack Query** for data fetching
- **Recharts** for analytics graphs

### Backend
- **Next.js API Routes**
- **Drizzle ORM** with PostgreSQL (Neon)
- **Google OAuth** (next-auth or custom)
- **BTCMap API** client
- **YouTube Data API** (optional)

### Infrastructure
- **Vercel** for hosting
- **Neon** PostgreSQL database
- **Upstash Redis** for rate limiting
- **Resend** for email notifications
- **Cloudinary** or **Uploadcare** for logo uploads

### Monitoring
- **Sentry** for error tracking
- **Vercel Analytics** for performance
- **Custom dashboard** for system health

---

## 💰 Funding Formula (Suggested)

Based on CBAF's current model:

```typescript
// Suggested allocation formula
function calculateFunding(metrics: EconomyMetrics) {
  const BASE_AMOUNT = 500_000; // Base: 500k sats
  const VIDEO_BONUS = 50_000; // 50k per approved video
  const MERCHANT_BONUS = 30_000; // 30k per unique merchant
  const NEW_MERCHANT_BONUS = 100_000; // 100k per new merchant

  const total =
    BASE_AMOUNT +
    metrics.videosApproved * VIDEO_BONUS +
    metrics.merchantsTotal * MERCHANT_BONUS +
    metrics.merchantsNew * NEW_MERCHANT_BONUS;

  return total;
}

// Example:
// Economy A: 45 videos, 32 merchants, 8 new
// = 500k + (45 × 50k) + (32 × 30k) + (8 × 100k)
// = 500k + 2.25M + 960k + 800k
// = 4.51M sats
```

**Configurable by Super Admin:**
- Adjust base amount
- Change video bonus
- Modify merchant bonuses
- Set caps and minimums

---

## 🎯 Migration Strategy

### From Spreadsheet to Platform

**Phase 1: Parallel Run (Month 1)**
- BCEs use both spreadsheet and platform
- Admins compare data for accuracy
- Fix any discrepancies

**Phase 2: Platform Primary (Month 2)**
- BCEs submit via platform only
- Spreadsheet as backup/reference
- Train all BCEs on new system

**Phase 3: Full Migration (Month 3)**
- Deprecate spreadsheet
- Import historical data from sheets
- Archive old Telegram posts
- Platform is single source of truth

**Training Materials:**
- Video tutorials for BCEs
- Admin guide with screenshots
- Quick reference cards
- Live onboarding sessions

---

## 📖 Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Set up database schema** - Create all tables with Drizzle
3. **Implement Google OAuth** - Authentication foundation
4. **Build BCE registration** - First user flow
5. **Create merchant management** - BTCMap integration
6. **Develop video submission** - Core feature
7. **Build admin review** - Approval workflow
8. **Add analytics** - Rankings and stats
9. **Integrate Fastlight** - Payment system
10. **Launch pilot** - Start with 5 economies
11. **Iterate and scale** - Roll out to all 33 economies

---

**Ready to build the future of CBAF management?** 🚀

This platform will save admins hundreds of hours per month, provide unprecedented insights into circular economy growth, and ensure transparent, efficient funding distribution across Africa's Bitcoin communities.

Let's start with Phase 1: Database Schema!
