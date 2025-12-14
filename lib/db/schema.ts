import { pgTable, uuid, text, integer, timestamp, boolean, numeric, bigint, index } from 'drizzle-orm/pg-core';

export const validationSessions = pgTable('validation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileName: text('file_name').notNull(),
  totalAddresses: integer('total_addresses').notNull(),
  validCount: integer('valid_count').default(0).notNull(),
  invalidCount: integer('invalid_count').default(0).notNull(),
  fixedCount: integer('fixed_count').default(0).notNull(),
  status: text('status').notNull().$type<'processing' | 'completed' | 'failed'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const addressValidations = pgTable('address_validations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => validationSessions.id, { onDelete: 'cascade' })
    .notNull(),
  originalAddress: text('original_address').notNull(),
  cleanedAddress: text('cleaned_address'),
  status: text('status').notNull().$type<'valid' | 'invalid' | 'fixed'>(),
  errorMessage: text('error_message'),
  validatedAt: timestamp('validated_at').defaultNow().notNull(),
});

export type ValidationSession = typeof validationSessions.$inferSelect;
export type NewValidationSession = typeof validationSessions.$inferInsert;
export type AddressValidation = typeof addressValidations.$inferSelect;
export type NewAddressValidation = typeof addressValidations.$inferInsert;

// ============================================================================
// CBAF (Circular Bitcoin Africa Fund) Management System
// ============================================================================

// Economies Table - Bitcoin Circular Economy Profiles
export const economies = pgTable('economies', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Google OAuth
  googleId: text('google_id').notNull().unique(),
  googleEmail: text('google_email').notNull(),
  googleName: text('google_name'),
  googleAvatar: text('google_avatar'),

  // Economy Profile
  economyName: text('economy_name').notNull(),
  slug: text('slug').notNull().unique(),
  country: text('country').notNull(),
  city: text('city'),
  description: text('description'),

  // Contact Info
  website: text('website'),
  twitter: text('twitter'),
  telegram: text('telegram'),
  contactEmail: text('contact_email'),

  // Location
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),

  // Payment Details
  lightningAddress: text('lightning_address'),
  lnurlPay: text('lnurl_pay'),
  onchainAddress: text('onchain_address'),

  // Membership
  joinedCBAFAt: timestamp('joined_cbaf_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),

  // Statistics (cached)
  totalVideosSubmitted: integer('total_videos_submitted').default(0),
  totalVideosApproved: integer('total_videos_approved').default(0),
  totalMerchantsRegistered: integer('total_merchants_registered').default(0),
  totalFundingReceived: bigint('total_funding_received', { mode: 'number' }).default(0),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at'),
}, (table) => ({
  googleIdIdx: index('economy_google_id_idx').on(table.googleId),
  slugIdx: index('economy_slug_idx').on(table.slug),
  activeIdx: index('economy_active_idx').on(table.isActive),
  contactEmailIdx: index('economy_contact_email_idx').on(table.contactEmail),
}));

// Merchants Table - Registered Merchants with BTCMap Links
export const merchants = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Ownership
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  // BTCMap Integration
  btcmapUrl: text('btcmap_url').notNull(),
  osmNodeId: text('osm_node_id'),

  // Merchant Details
  merchantName: text('merchant_name'),
  category: text('category'),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
  address: text('address'),

  // Custom Details
  localName: text('local_name'),
  notes: text('notes'),

  // Verification
  btcmapVerified: boolean('btcmap_verified').default(false),
  lastVerifiedAt: timestamp('last_verified_at'),
  verificationError: text('verification_error'),

  // Payment Details
  lightningAddress: text('lightning_address'),
  paymentProvider: text('payment_provider')
    .$type<'blink' | 'fedi' | 'machankura' | 'other'>()
    .default('blink'),
  addressVerified: boolean('address_verified').default(false),
  addressVerificationError: text('address_verification_error'),
  addressVerifiedAt: timestamp('address_verified_at'),
  addressVerifiedBy: uuid('address_verified_by')
    .references(() => adminUsers.id),

  // Usage Statistics
  timesAppearedInVideos: integer('times_appeared_in_videos').default(0),
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
  addressVerifiedIdx: index('merchant_address_verified_idx').on(table.addressVerified),
  paymentProviderIdx: index('merchant_payment_provider_idx').on(table.paymentProvider),
}));

// Video Submissions Table - Proof of Work Videos
export const videoSubmissions = pgTable('video_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Ownership
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  // Video Details
  videoUrl: text('video_url').notNull(),
  videoUrlHash: text('video_url_hash').notNull(), // SHA-256 hash for duplicate detection
  videoTitle: text('video_title'),
  videoDescription: text('video_description'),
  videoDuration: integer('video_duration'),
  videoThumbnail: text('video_thumbnail'),

  // Platform Detection
  platform: text('platform').$type<'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'other'>(),
  videoId: text('video_id'),

  // Month/Period Tracking
  submissionMonth: text('submission_month').notNull(), // "2025-12"
  submissionYear: integer('submission_year').notNull(),

  // Review Status
  status: text('status')
    .notNull()
    .$type<'pending' | 'approved' | 'rejected' | 'flagged' | 'duplicate'>()
    .default('pending'),

  // Duplicate Detection
  isDuplicate: boolean('is_duplicate').default(false),
  duplicateOfId: uuid('duplicate_of_id'),
  duplicateDetectedAt: timestamp('duplicate_detected_at'),

  // Admin Review
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  adminComments: text('admin_comments'),
  rejectionReason: text('rejection_reason'),

  // Merchant Association
  merchantCount: integer('merchant_count').default(0),
  newMerchantCount: integer('new_merchant_count').default(0),
  returningMerchantCount: integer('returning_merchant_count').default(0),

  // Payment Address Verification
  addressesVerified: boolean('addresses_verified').default(false),
  addressesVerifiedAt: timestamp('addresses_verified_at'),
  invalidAddressesCount: integer('invalid_addresses_count').default(0),

  // Funding Impact
  fundingEarned: bigint('funding_earned', { mode: 'number' }).default(0),

  // Timestamps
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  economyIdx: index('video_economy_idx').on(table.economyId),
  statusIdx: index('video_status_idx').on(table.status),
  monthIdx: index('video_month_idx').on(table.submissionMonth),
  yearIdx: index('video_year_idx').on(table.submissionYear),
  urlHashIdx: index('video_url_hash_idx').on(table.videoUrlHash), // For duplicate detection
  duplicateIdx: index('video_duplicate_idx').on(table.isDuplicate),
  addressesVerifiedIdx: index('video_addresses_verified_idx').on(table.addressesVerified),
}));

// Video Merchants Junction Table
export const videoMerchants = pgTable('video_merchants', {
  id: uuid('id').primaryKey().defaultRandom(),

  videoId: uuid('video_id')
    .references(() => videoSubmissions.id, { onDelete: 'cascade' })
    .notNull(),

  merchantId: uuid('merchant_id')
    .references(() => merchants.id, { onDelete: 'cascade' })
    .notNull(),

  // Context
  isNewMerchant: boolean('is_new_merchant').default(false),
  merchantRole: text('merchant_role'),
  notes: text('notes'),

  // Timestamps
  linkedAt: timestamp('linked_at').defaultNow().notNull(),
}, (table) => ({
  videoIdx: index('vm_video_idx').on(table.videoId),
  merchantIdx: index('vm_merchant_idx').on(table.merchantId),
  uniqueLink: index('vm_unique_idx').on(table.videoId, table.merchantId),
}));

// Admin Users Table
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
  canSendPayments: boolean('can_send_payments').default(false),
  canManageAdmins: boolean('can_manage_admins').default(false),

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

// Funding Disbursements Table
export const fundingDisbursements = pgTable('funding_disbursements', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Payment Details
  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  amountSats: bigint('amount_sats', { mode: 'number' }).notNull(),
  amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }),

  // Period
  fundingMonth: text('funding_month').notNull(),
  fundingYear: integer('funding_year').notNull(),

  // Metrics
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
  initiatedBy: text('initiated_by').notNull(),
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

// Monthly Rankings Table
export const monthlyRankings = pgTable('monthly_rankings', {
  id: uuid('id').primaryKey().defaultRandom(),

  economyId: uuid('economy_id')
    .references(() => economies.id, { onDelete: 'cascade' })
    .notNull(),

  // Period
  month: text('month').notNull(),
  year: integer('year').notNull(),

  // Metrics
  videosSubmitted: integer('videos_submitted').default(0),
  videosApproved: integer('videos_approved').default(0),
  videosRejected: integer('videos_rejected').default(0),
  approvalRate: numeric('approval_rate', { precision: 5, scale: 2 }),

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

// Email Notifications Table - Track all emails sent by CBAF
export const emailNotifications = pgTable('email_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Recipient
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name'),

  // Email Details
  templateType: text('template_type')
    .notNull()
    .$type<'address_correction_request' | 'address_verified' | 'funding_processed'>(),
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  textBody: text('text_body'),

  // Context
  economyId: uuid('economy_id').references(() => economies.id, { onDelete: 'cascade' }),
  videoId: uuid('video_id').references(() => videoSubmissions.id, { onDelete: 'cascade' }),

  // Status
  status: text('status')
    .notNull()
    .$type<'pending' | 'sent' | 'failed' | 'bounced'>()
    .default('pending'),
  errorMessage: text('error_message'),

  // Provider Details (Resend)
  providerMessageId: text('provider_message_id'),

  // Metadata
  sentBy: uuid('sent_by').references(() => adminUsers.id),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  recipientIdx: index('email_recipient_idx').on(table.recipientEmail),
  statusIdx: index('email_status_idx').on(table.status),
  templateIdx: index('email_template_idx').on(table.templateType),
  economyIdx: index('email_economy_idx').on(table.economyId),
  sentAtIdx: index('email_sent_at_idx').on(table.sentAt),
}));

// Super Admin Settings Table - Encrypted configuration storage
export const superAdminSettings = pgTable('super_admin_settings', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Setting identification
  key: text('key').notNull().unique(), // e.g., 'blink_api_key'

  // Encrypted value
  encryptedValue: text('encrypted_value').notNull(),

  // Metadata
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),

  // Connection status (for API integrations)
  isConnected: boolean('is_connected').default(false),
  lastTested: timestamp('last_tested'),

  // Additional data (JSON string for flexible storage)
  metadata: text('metadata'), // JSON string for balance, etc.

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  keyIdx: index('settings_key_idx').on(table.key),
  activeIdx: index('settings_active_idx').on(table.isActive),
}));

// Type exports for CBAF tables
export type Economy = typeof economies.$inferSelect;
export type NewEconomy = typeof economies.$inferInsert;
export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export type VideoSubmission = typeof videoSubmissions.$inferSelect;
export type NewVideoSubmission = typeof videoSubmissions.$inferInsert;
export type VideoMerchant = typeof videoMerchants.$inferSelect;
export type NewVideoMerchant = typeof videoMerchants.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type FundingDisbursement = typeof fundingDisbursements.$inferSelect;
export type NewFundingDisbursement = typeof fundingDisbursements.$inferInsert;
export type MonthlyRanking = typeof monthlyRankings.$inferSelect;
export type NewMonthlyRanking = typeof monthlyRankings.$inferInsert;
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type NewEmailNotification = typeof emailNotifications.$inferInsert;
export type SuperAdminSetting = typeof superAdminSettings.$inferSelect;
export type NewSuperAdminSetting = typeof superAdminSettings.$inferInsert;
