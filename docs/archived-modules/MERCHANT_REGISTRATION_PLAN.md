# Merchant Registration Module - Implementation Plan
**Multi-Economy BTCMap Integration System**

---

## 🎯 Vision

Build a universal merchant registration tool that enables **any Bitcoin circular economy** worldwide to:
- Register merchants through a simple web form
- Have admins review and approve submissions
- Automatically publish verified merchants to OpenStreetMap
- Get merchants listed on BTCMap within 24-48 hours
- Manage multiple economies with custom boundaries and settings

---

## 🌍 Key Differences from Original Spec

### Original (Kibera-specific):
- Hard-coded Kibera coordinates
- Single economy focus
- MySQL database
- Fixed "afribit:merchant_id" tags

### New (Multi-Economy):
- **Configurable economy boundaries** (any location worldwide)
- **Multiple economies support** (Bitcoin Beach, Bitcoin Ekasi, Bitcoin Jungle, etc.)
- **PostgreSQL with Drizzle ORM** (already using Neon)
- **Economy-specific tags** (e.g., `bitcoin_beach:merchant_id`, `ekasi:merchant_id`)
- **Economy-scoped admins** (users can manage specific economies)
- **Flexible rate limiting** per economy
- **Currency localization** (display prices in local currency equivalents)

---

## 📊 Enhanced Database Schema

### 1. `economies` Table
Store configuration for each Bitcoin circular economy.

```typescript
export const economies = pgTable('economies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Bitcoin Beach", "Bitcoin Ekasi"
  slug: text('slug').notNull().unique(), // "bitcoin-beach", "ekasi"
  country: text('country').notNull(), // "El Salvador", "South Africa"
  description: text('description'),
  
  // Geographic Boundaries
  minLatitude: numeric('min_latitude', { precision: 10, scale: 8 }).notNull(),
  maxLatitude: numeric('max_latitude', { precision: 10, scale: 8 }).notNull(),
  minLongitude: numeric('min_longitude', { precision: 11, scale: 8 }).notNull(),
  maxLongitude: numeric('max_longitude', { precision: 11, scale: 8 }).notNull(),
  
  // OSM Tagging
  osmTagPrefix: text('osm_tag_prefix').notNull(), // "bitcoin_beach", "ekasi"
  
  // Contact & Settings
  adminEmail: text('admin_email').notNull(),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  
  // Rate Limiting
  maxSubmissionsPerHour: integer('max_submissions_per_hour').default(10),
  maxSubmissionsPerEmail: integer('max_submissions_per_email').default(3),
  
  // Early Adopter Program
  earlyAdopterProgramActive: boolean('early_adopter_program_active').default(false),
  earlyAdopterCount: integer('early_adopter_count').default(0),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2. `merchant_submissions` Table
Store all merchant registration submissions.

```typescript
export const merchantSubmissions = pgTable('merchant_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Economy Reference
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Business Info
  businessName: text('business_name').notNull(),
  categoryKey: text('category_key'), // 'amenity' or 'shop'
  categoryValue: text('category_value').notNull(), // 'restaurant', 'cafe', etc.
  description: text('description'),
  
  // Location
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  address: text('address'),
  
  // Contact
  phoneNumber: text('phone_number'),
  website: text('website'),
  contactEmail: text('contact_email').notNull(),
  
  // Payment Methods
  paymentOnchain: boolean('payment_onchain').default(false),
  paymentLightning: boolean('payment_lightning').default(false),
  paymentLightningContactless: boolean('payment_lightning_contactless').default(false),
  
  // Status & Workflow
  status: text('status')
    .notNull()
    .$type<'pending' | 'approved' | 'merchant_confirmed' | 'published' | 'rejected'>()
    .default('pending'),
  
  confirmationToken: text('confirmation_token').unique(),
  confirmationTokenExpiresAt: timestamp('confirmation_token_expires_at'),
  merchantConfirmedAt: timestamp('merchant_confirmed_at'),
  rejectionReason: text('rejection_reason'),
  
  // OSM Integration
  osmNodeId: bigint('osm_node_id', { mode: 'number' }),
  osmChangesetId: bigint('osm_changeset_id', { mode: 'number' }),
  osmUrl: text('osm_url'),
  
  // BTCMap Integration
  btcmapSynced: boolean('btcmap_synced').default(false),
  btcmapUrl: text('btcmap_url'),
  btcmapLastChecked: timestamp('btcmap_last_checked'),
  
  // Early Adopter
  isEarlyAdopter: boolean('is_early_adopter').default(false),
  adopterNumber: integer('adopter_number'),
  
  // Verification
  verificationStatus: text('verification_status')
    .$type<'pending' | 'verified' | 'rejected'>()
    .default('pending'),
  verifiedAt: timestamp('verified_at'),
  verifiedByEmail: text('verified_by_email'),
  verificationNotes: text('verification_notes'),
  
  // Metadata
  submitterIp: text('submitter_ip'),
  userAgent: text('user_agent'),
  
  // Timestamps
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  economyIdx: index('economy_idx').on(table.economyId),
  statusIdx: index('status_idx').on(table.status),
  emailIdx: index('email_idx').on(table.contactEmail),
  osmNodeIdx: index('osm_node_idx').on(table.osmNodeId),
  confirmationTokenIdx: index('confirmation_token_idx').on(table.confirmationToken),
}));
```

### 3. `economy_admins` Table
Manage who can approve submissions for which economies.

```typescript
export const economyAdmins = pgTable('economy_admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),
  email: text('email').notNull(),
  role: text('role').$type<'admin' | 'moderator' | 'viewer'>().default('admin'),
  canApprove: boolean('can_approve').default(true),
  canReject: boolean('can_reject').default(true),
  canPublish: boolean('can_publish').default(false), // OSM publishing permission
  
  addedAt: timestamp('added_at').defaultNow().notNull(),
  addedBy: text('added_by'),
}, (table) => ({
  economyEmailIdx: index('economy_email_idx').on(table.economyId, table.email),
}));
```

### 4. `osm_publish_queue` Table
Track pending OSM publications (for batch processing).

```typescript
export const osmPublishQueue = pgTable('osm_publish_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantSubmissionId: uuid('merchant_submission_id')
    .references(() => merchantSubmissions.id, { onDelete: 'cascade' })
    .notNull(),
  
  priority: integer('priority').default(5), // 1-10, higher = more urgent
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  
  status: text('status')
    .$type<'pending' | 'processing' | 'completed' | 'failed'>()
    .default('pending'),
  
  lastError: text('last_error'),
  
  scheduledFor: timestamp('scheduled_for').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('queue_status_idx').on(table.status),
  scheduledIdx: index('queue_scheduled_idx').on(table.scheduledFor),
}));
```

---

## 🏗️ Architecture Components

### Frontend Pages

1. **`/merchants/register`** - Public registration form
   - Economy selector (dropdown or auto-detect from URL param)
   - Interactive map for location picking
   - Category selector with icons
   - Payment method checkboxes
   - Email verification

2. **`/merchants/[economySlug]`** - Public merchant directory
   - Interactive map showing all published merchants
   - Filter by category, payment methods
   - Search by name
   - List view with details

3. **`/admin/merchants/submissions`** - Admin review dashboard
   - Filter by economy (if managing multiple)
   - Filter by status
   - Map preview for each submission
   - Quick approve/reject actions
   - Bulk actions

4. **`/admin/merchants/published`** - Published merchants management
   - View all published merchants
   - Check BTCMap sync status
   - Re-publish to OSM if needed
   - Edit merchant details (updates OSM)

5. **`/admin/economies`** - Economy management
   - Create new economies
   - Edit boundaries and settings
   - Manage admins
   - View statistics

6. **`/confirm-merchant/[token]`** - Merchant email confirmation page

### API Endpoints

#### Public Endpoints

- `POST /api/merchants/submit` - Submit new merchant
- `GET /api/merchants/[economySlug]` - Get published merchants for economy
- `GET /api/economies` - List active economies
- `GET /api/confirm-merchant/[token]` - Confirm merchant via email

#### Admin Endpoints (Auth Required)

- `GET /api/admin/merchants/submissions` - List submissions
- `POST /api/admin/merchants/approve` - Approve submission
- `POST /api/admin/merchants/reject` - Reject submission
- `GET /api/admin/merchants/stats` - Get economy statistics
- `POST /api/admin/economies/create` - Create new economy
- `PUT /api/admin/economies/[id]` - Update economy settings

#### Integration Endpoints

- `POST /api/osm/publish` - Trigger OSM publishing queue
- `GET /api/osm/queue-status` - Check publishing queue status
- `POST /api/btcmap/check-sync` - Manually check BTCMap sync
- `POST /api/btcmap/update-links` - Update BTCMap URLs in database

### Background Jobs

1. **OSM Publisher** (`scripts/osm-publisher.ts`)
   - Runs every 15 minutes
   - Processes `osm_publish_queue` items
   - Creates OSM changesets
   - Updates merchant records with OSM node IDs

2. **BTCMap Sync Checker** (`scripts/btcmap-sync-checker.ts`)
   - Runs daily
   - Checks if published merchants appear on BTCMap
   - Updates `btcmap_synced` and `btcmap_url`
   - Notifies admins of sync issues

3. **Token Cleanup** (`scripts/cleanup-expired-tokens.ts`)
   - Runs daily
   - Removes expired confirmation tokens
   - Archives old rejected submissions

---

## 🎨 User Experience Flow

### Merchant Registration Journey

```
1. Merchant visits tools.afribit.africa
   ↓
2. Clicks "Register Your Business" in Merchants module
   ↓
3. Selects their economy (Bitcoin Beach, Ekasi, etc.)
   OR economy is auto-detected from URL: /merchants/register?economy=bitcoin-beach
   ↓
4. Fills out form:
   - Business name ✍️
   - Category (restaurant, shop, etc.) 🏪
   - Drops pin on map 📍
   - Adds address (optional) 🏠
   - Phone & website (optional) 📞
   - Email (required) ✉️
   - Payment methods ⚡
   - Additional info 📝
   ↓
5. Submits form
   ↓
6. Receives confirmation: "Thank you! Your submission is under review."
   ↓
7. Admin reviews submission in dashboard
   ↓
8. Admin approves → Merchant receives confirmation email
   ↓
9. Merchant clicks link in email: "Yes, this is correct"
   ↓
10. System automatically publishes to OpenStreetMap
    ↓
11. Merchant appears on BTCMap within 24-48 hours
    ↓
12. Merchant receives final email: "You're now on BTCMap! 🎉"
```

### Admin Workflow

```
1. Admin logs in to dashboard
   ↓
2. Sees pending submissions badge (e.g., "12 pending")
   ↓
3. Clicks "Review Submissions"
   ↓
4. Views submission card:
   - Business name & details
   - Location on mini-map
   - Payment methods
   - Contact info
   ↓
5. Options:
   - ✅ Approve (sends confirmation email to merchant)
   - ❌ Reject (with reason)
   - ✏️ Edit (fix typos, adjust location)
   - 📧 Contact merchant (ask for clarification)
   ↓
6. After approval, monitors "Awaiting Merchant Confirmation" list
   ↓
7. Once merchant confirms, submission moves to "Ready to Publish"
   ↓
8. Background job publishes to OSM automatically
   ↓
9. Admin can check "Published Merchants" to verify OSM/BTCMap links
```

---

## 🔐 Security & Validation

### Rate Limiting Strategy

- **Per IP:** 10 submissions per hour (configurable per economy)
- **Per Email:** 3 submissions per hour
- **Per Economy:** Optional max submissions per day
- Use Redis for fast rate limit checks
- Store attempts in database for audit trail

### Validation Rules

1. **Business Name:** 2-200 characters, no special chars
2. **Email:** Valid format, not disposable
3. **Coordinates:** Must be within economy boundaries
4. **Category:** Must be from predefined OSM-compatible list
5. **Payment Methods:** At least one must be selected
6. **Phone:** Optional, but validated if provided (international format)
7. **Website:** Optional, but must be valid URL if provided

### Duplicate Detection

```typescript
// Check for duplicates before inserting
async function checkDuplicates(
  economyId: string,
  businessName: string,
  email: string,
  lat: number,
  lon: number
) {
  // 1. Exact email match in last 30 days
  const emailDupe = await db.query.merchantSubmissions.findFirst({
    where: and(
      eq(merchantSubmissions.economyId, economyId),
      eq(merchantSubmissions.contactEmail, email),
      gte(merchantSubmissions.submittedAt, thirtyDaysAgo)
    )
  });
  
  // 2. Same business name + similar location (within 100m)
  const nameDupe = await db.query.merchantSubmissions.findFirst({
    where: and(
      eq(merchantSubmissions.economyId, economyId),
      ilike(merchantSubmissions.businessName, businessName),
      // Use PostGIS or manual calculation for proximity
    )
  });
  
  return { emailDupe, nameDupe };
}
```

---

## 🗺️ OSM Integration Details

### OAuth Setup

Each economy admin needs OSM credentials. Options:

**Option A: Shared Account**
- Create one OSM account per economy
- Store credentials encrypted in database
- All publishes use that account

**Option B: Admin-Linked Accounts**
- Each admin connects their OSM account
- Publishes attributed to admin who approved
- More transparent but complex setup

**Recommendation:** Start with Option A, add Option B later.

### OSM Tag Generation

```typescript
function generateOSMTags(
  merchant: MerchantSubmission,
  economy: Economy
): Record<string, string> {
  const tags: Record<string, string> = {
    name: merchant.businessName,
    [merchant.categoryKey || 'amenity']: merchant.categoryValue,
    
    // Bitcoin payments
    'payment:bitcoin': 'yes',
    'currency:XBT': 'yes',
  };
  
  if (merchant.paymentLightning) {
    tags['payment:lightning'] = 'yes';
  }
  
  if (merchant.paymentOnchain) {
    tags['payment:onchain'] = 'yes';
  }
  
  if (merchant.paymentLightningContactless) {
    tags['payment:lightning_contactless'] = 'yes';
  }
  
  if (merchant.address) {
    tags['addr:full'] = merchant.address;
  }
  
  if (merchant.phoneNumber) {
    tags['contact:phone'] = merchant.phoneNumber;
  }
  
  if (merchant.website) {
    tags['contact:website'] = merchant.website;
  }
  
  if (merchant.contactEmail) {
    tags['contact:email'] = merchant.contactEmail;
  }
  
  if (merchant.description) {
    tags['description'] = merchant.description;
  }
  
  // Economy-specific tags
  tags[`${economy.osmTagPrefix}:merchant_id`] = merchant.id;
  tags[`${economy.osmTagPrefix}:verified`] = 'yes';
  
  if (merchant.isEarlyAdopter) {
    tags[`${economy.osmTagPrefix}:early_adopter`] = 'yes';
    tags[`${economy.osmTagPrefix}:adopter_number`] = merchant.adopterNumber.toString();
  }
  
  // Add source attribution
  tags['source'] = `${economy.name} Merchant Registration`;
  
  return tags;
}
```

### Publishing Process

```typescript
async function publishMerchantToOSM(
  merchant: MerchantSubmission,
  economy: Economy
) {
  // 1. Get OSM credentials
  const osmAuth = await getOSMCredentials(economy.id);
  
  // 2. Create changeset
  const changesetId = await createOSMChangeset({
    comment: `Adding ${merchant.businessName} to ${economy.name}`,
    source: economy.websiteUrl,
    created_by: 'Afribitools Merchant Registration',
  });
  
  // 3. Generate tags
  const tags = generateOSMTags(merchant, economy);
  
  // 4. Create node
  const nodeId = await createOSMNode({
    changesetId,
    lat: merchant.latitude,
    lon: merchant.longitude,
    tags,
  });
  
  // 5. Close changeset
  await closeOSMChangeset(changesetId);
  
  // 6. Update database
  await db.update(merchantSubmissions)
    .set({
      osmNodeId: nodeId,
      osmChangesetId: changesetId,
      osmUrl: `https://www.openstreetmap.org/node/${nodeId}`,
      status: 'published',
      publishedAt: new Date(),
    })
    .where(eq(merchantSubmissions.id, merchant.id));
  
  // 7. Remove from queue
  await db.delete(osmPublishQueue)
    .where(eq(osmPublishQueue.merchantSubmissionId, merchant.id));
  
  return { nodeId, changesetId };
}
```

---

## 📧 Email Templates

### 1. Submission Received (to Merchant)

**Subject:** Thank you for registering with [Economy Name]!

```
Hi there,

Thank you for registering your business with [Economy Name]!

Business Name: [Business Name]
Location: [Address or Coordinates]
Payment Methods: [Lightning, Onchain, etc.]

Your submission is now under review by our team. We'll send you a 
confirmation email within 24-48 hours.

If you have any questions, reply to this email.

Best regards,
[Economy Name] Team
```

### 2. Admin Approved - Merchant Confirmation (to Merchant)

**Subject:** Please confirm your business details for [Economy Name]

```
Hi there,

Great news! Your business has been approved by [Economy Name]!

Business Name: [Business Name]
Category: [Category]
Location: [Address or Coordinates]
Payment Methods: [Lightning, Onchain, etc.]

IMPORTANT: Please confirm these details are correct by clicking the link below:

[Confirm Details Button] → /confirm-merchant/[token]

This link expires in 7 days.

If any details are incorrect, reply to this email and we'll update them.

Once confirmed, your business will be:
✅ Published to OpenStreetMap
✅ Listed on BTCMap within 24-48 hours
✅ Discoverable by Bitcoin users worldwide!

Best regards,
[Economy Name] Team
```

### 3. Merchant Confirmed - Publishing Started (to Merchant)

**Subject:** Your business is being published to BTCMap!

```
Hi there,

Thanks for confirming your details!

Your business is now being published to OpenStreetMap. Within 24-48 hours,
you'll appear on BTCMap.org - the global directory of Bitcoin-accepting
businesses.

We'll send you another email with your BTCMap link once the sync is complete.

Best regards,
[Economy Name] Team
```

### 4. Published to BTCMap (to Merchant)

**Subject:** 🎉 You're now on BTCMap!

```
Hi there,

Exciting news! Your business is now live on BTCMap!

View your listing:
🌍 OpenStreetMap: [OSM URL]
⚡ BTCMap: [BTCMap URL]

Share these links with customers to help them find you!

You're now part of the global Bitcoin circular economy. Welcome! 🧡

Best regards,
[Economy Name] Team
```

### 5. Submission Rejected (to Merchant)

**Subject:** Update on your [Economy Name] registration

```
Hi there,

Thank you for your interest in [Economy Name].

Unfortunately, we couldn't approve your submission at this time.

Reason: [Rejection Reason]

If you'd like to resubmit with corrections, please visit:
[Registration URL]

If you have questions, reply to this email.

Best regards,
[Economy Name] Team
```

---

## 🎯 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- ✅ Create database schema with migrations
- ✅ Set up Drizzle ORM models
- ✅ Create economy seed data (Bitcoin Beach, Ekasi, Kibera)
- ✅ Build basic API endpoints (submit, list)
- ✅ Set up email service integration

### Phase 2: Registration Form (Week 2)
- ✅ Build `/merchants/register` page
- ✅ Add interactive map with location picker
- ✅ Category selector with OSM-compatible categories
- ✅ Form validation and submission
- ✅ Economy selector/auto-detection
- ✅ Success confirmation page

### Phase 3: Admin Dashboard (Week 2-3)
- ✅ Authentication for admin routes
- ✅ Build `/admin/merchants/submissions` review page
- ✅ Approve/reject actions with modals
- ✅ Map preview component
- ✅ Filter and search functionality
- ✅ Batch operations

### Phase 4: Two-Step Approval (Week 3)
- ✅ Generate confirmation tokens
- ✅ Send approval emails to merchants
- ✅ Build `/confirm-merchant/[token]` page
- ✅ Token validation and expiry handling
- ✅ Update status workflow

### Phase 5: OSM Integration (Week 4)
- ✅ Set up OSM OAuth credentials
- ✅ Build OSM publishing service
- ✅ Create publish queue system
- ✅ Build `scripts/osm-publisher.ts`
- ✅ Test publishing to OSM sandbox first
- ✅ Error handling and retry logic

### Phase 6: BTCMap Sync (Week 4-5)
- ✅ Build BTCMap API client
- ✅ Create `scripts/btcmap-sync-checker.ts`
- ✅ Update merchant records with BTCMap URLs
- ✅ Send final confirmation emails
- ✅ Schedule daily sync checks

### Phase 7: Public Directory (Week 5)
- ✅ Build `/merchants/[economySlug]` page
- ✅ Interactive map showing all merchants
- ✅ Filter by category, payment methods
- ✅ Search functionality
- ✅ Merchant detail cards
- ✅ Embed BTCMap widget

### Phase 8: Economy Management (Week 6)
- ✅ Build `/admin/economies` page
- ✅ Create/edit economy forms
- ✅ Boundary editor with map
- ✅ Admin management per economy
- ✅ Statistics dashboard

### Phase 9: Testing & Polish (Week 7)
- ✅ End-to-end testing
- ✅ Load testing for rate limiting
- ✅ Email template refinement
- ✅ Mobile responsive design
- ✅ Accessibility audit
- ✅ Documentation

### Phase 10: Launch (Week 8)
- ✅ Deploy to production
- ✅ Set up monitoring and alerts
- ✅ Create user guides
- ✅ Announce to Bitcoin communities
- ✅ Onboard first economies

---

## 📚 Pre-Built Economy Configurations

### 1. Bitcoin Beach (El Zonte, El Salvador)

```typescript
{
  name: "Bitcoin Beach",
  slug: "bitcoin-beach",
  country: "El Salvador",
  description: "The original Bitcoin circular economy in El Zonte",
  minLatitude: 13.48,
  maxLatitude: 13.52,
  minLongitude: -89.45,
  maxLongitude: -89.40,
  osmTagPrefix: "bitcoin_beach",
  adminEmail: "admin@bitcoinbeach.com",
  websiteUrl: "https://www.bitcoinbeach.com/",
  maxSubmissionsPerHour: 10,
  earlyAdopterProgramActive: true,
}
```

### 2. Bitcoin Ekasi (Mossel Bay, South Africa)

```typescript
{
  name: "Bitcoin Ekasi",
  slug: "ekasi",
  country: "South Africa",
  description: "Bitcoin circular economy in Mossel Bay township",
  minLatitude: -34.22,
  maxLatitude: -34.16,
  minLongitude: 22.10,
  maxLongitude: 22.16,
  osmTagPrefix: "ekasi",
  adminEmail: "admin@bitcoinekasi.com",
  websiteUrl: "https://bitcoinekasi.com/",
  maxSubmissionsPerHour: 15,
  earlyAdopterProgramActive: true,
}
```

### 3. Kibera Bitcoin (Nairobi, Kenya)

```typescript
{
  name: "Kibera Bitcoin",
  slug: "kibera",
  country: "Kenya",
  description: "Bitcoin adoption in Kibera, Nairobi",
  minLatitude: -1.3300,
  maxLatitude: -1.3000,
  minLongitude: 36.7700,
  maxLongitude: 36.8000,
  osmTagPrefix: "kibera",
  adminEmail: "admin@afribit.africa",
  websiteUrl: "https://afribit.africa/",
  maxSubmissionsPerHour: 10,
  earlyAdopterProgramActive: true,
}
```

### 4. Bitcoin Jungle (Costa Rica)

```typescript
{
  name: "Bitcoin Jungle",
  slug: "bitcoin-jungle",
  country: "Costa Rica",
  description: "Bitcoin circular economy in Uvita, Costa Rica",
  minLatitude: 9.10,
  maxLatitude: 9.20,
  minLongitude: -83.80,
  maxLongitude: -83.70,
  osmTagPrefix: "bitcoin_jungle",
  adminEmail: "admin@bitcoinjungle.app",
  websiteUrl: "https://www.bitcoinjungle.app/",
  maxSubmissionsPerHour: 10,
  earlyAdopterProgramActive: false,
}
```

---

## 🔧 Technical Stack

### Frontend
- **Next.js 14** (already in use)
- **React Leaflet** or **Mapbox GL** for maps
- **Shadcn/ui** for components
- **React Hook Form** + **Zod** for validation
- **TanStack Query** for data fetching

### Backend
- **Next.js API Routes**
- **Drizzle ORM** with PostgreSQL (Neon)
- **Node-OSM-API** or custom OSM client
- **Axios** for external APIs
- **Node-Cron** for scheduled jobs

### Infrastructure
- **Vercel** for hosting
- **Neon** for PostgreSQL
- **Upstash Redis** for rate limiting
- **Resend** for emails
- **Sentry** for error tracking

---

## 🚀 Success Metrics

### Key Performance Indicators (KPIs)

1. **Merchant Onboarding**
   - Time from submission to BTCMap publish: < 48 hours
   - Submission approval rate: > 90%
   - Merchant confirmation rate: > 80%

2. **System Performance**
   - API response time: < 500ms
   - OSM publish success rate: > 95%
   - BTCMap sync success rate: > 99%

3. **User Satisfaction**
   - Admin review time: < 24 hours
   - Form completion rate: > 70%
   - Email open rate: > 60%

4. **Growth Metrics**
   - Number of economies onboarded
   - Total merchants registered
   - Monthly active economies

---

## 📖 Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Set up database schema** - Create migrations for all tables
3. **Build registration form** - Start with Phase 2
4. **Implement admin dashboard** - Follow with Phase 3
5. **Test OSM integration** - Use OSM sandbox environment
6. **Launch with pilot economy** - Start with Kibera or Bitcoin Beach
7. **Iterate based on feedback** - Refine UX and workflows

---

## 💡 Future Enhancements

- **Mobile App:** Native iOS/Android apps for merchant registration
- **WhatsApp Integration:** Submit merchants via WhatsApp bot
- **Analytics Dashboard:** Public stats per economy (merchant count, growth)
- **Merchant Profiles:** Enhanced listings with photos, hours, reviews
- **QR Code Generator:** Auto-generate QR codes for Lightning payments
- **Multi-Language Support:** Translate forms and emails
- **CSV Import:** Bulk upload merchants from spreadsheet
- **Merchant Portal:** Let merchants update their own info
- **Integration APIs:** Let other tools submit merchants programmatically

---

**Ready to build?** Let's start with Phase 1: Database Schema! 🚀
