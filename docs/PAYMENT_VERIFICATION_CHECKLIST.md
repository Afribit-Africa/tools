# CBAF Payment Verification - Implementation Checklist

## 📊 Progress Overview

**Total Phases**: 5
**Estimated Time**: 15-17 hours
**Current Status**: Research Complete ✅

---

## Phase A: Foundation (Database + Validation Infrastructure)

**Status**: ⏳ Not Started
**Duration**: 3-4 hours
**Prerequisites**: Resend account setup

### Database Migrations

- [ ] Create `migrations/001_add_payment_fields_to_merchants.sql`
  - [ ] Add `lightning_address` column
  - [ ] Add `payment_provider` column with enum check
  - [ ] Add `address_verified` boolean
  - [ ] Add `address_verification_error` text
  - [ ] Add `address_verified_at` timestamp
  - [ ] Add `address_verified_by` UUID foreign key
  - [ ] Create indexes for validation queries
  - [ ] Test migration on dev database

- [ ] Create `migrations/002_add_contact_email_to_economies.sql`
  - [ ] Add `contact_email` column
  - [ ] Backfill with `google_email`
  - [ ] Set NOT NULL constraint
  - [ ] Create index
  - [ ] Test migration

- [ ] Create `migrations/003_add_address_review_to_videos.sql`
  - [ ] Add `addresses_verified` boolean
  - [ ] Add `addresses_verified_at` timestamp
  - [ ] Add `invalid_addresses_count` integer
  - [ ] Create index
  - [ ] Test migration

- [ ] Create `migrations/004_create_email_notifications_table.sql`
  - [ ] Create full table structure
  - [ ] Create all indexes
  - [ ] Test migration

### Schema Updates

- [ ] Update `lib/db/schema.ts`
  - [ ] Add payment fields to merchants table definition
  - [ ] Add contactEmail to economies table
  - [ ] Add address review fields to videoSubmissions
  - [ ] Create emailNotifications table definition
  - [ ] Export new types
  - [ ] Run Drizzle Kit to generate types

### Payment Validation Service

- [ ] Create `lib/payment/validator.ts`
  - [ ] Define PaymentProvider type
  - [ ] Define PaymentValidationResult interface
  - [ ] Implement `validatePaymentAddress()` function
    - [ ] Blink validation (use existing lib)
    - [ ] Fedi format validation
    - [ ] Machankura format validation
    - [ ] Other provider handling
  - [ ] Implement `batchValidateAddresses()` function
    - [ ] Rate limiting logic
    - [ ] Progress callback support
    - [ ] Error handling
  - [ ] Write unit tests

- [ ] Create `lib/fedi/client.ts` (if API available)
  - [ ] Research Fedi API docs
  - [ ] Implement validation function
  - [ ] Add format regex validation
  - [ ] Write tests

- [ ] Create `lib/machankura/client.ts`
  - [ ] Research Machankura address format
  - [ ] Implement phone number validation
  - [ ] Add regex for supported countries
  - [ ] Write tests

### Email Service Setup

- [ ] Setup Resend account
  - [ ] Sign up at resend.com
  - [ ] Verify domain (or use test domain)
  - [ ] Get API key
  - [ ] Add to `.env.local`: `RESEND_API_KEY=re_xxx`

- [ ] Install dependencies
  - [ ] `npm install resend`
  - [ ] `npm install react-email` (optional)

- [ ] Create `lib/email/client.ts`
  - [ ] Initialize Resend client
  - [ ] Define SendEmailParams interface
  - [ ] Implement `sendEmail()` function
    - [ ] Call Resend API
    - [ ] Log to email_notifications table
    - [ ] Error handling
  - [ ] Implement `generateAddressCorrectionEmail()`
    - [ ] HTML template with inline CSS
    - [ ] Plain text version
    - [ ] Subject line
  - [ ] Implement `generateAddressVerifiedEmail()`
    - [ ] HTML template
    - [ ] Plain text version
  - [ ] Implement `generateFundingSummaryEmail()` (Phase D)
  - [ ] Test email sending (use personal email)

### Testing

- [ ] Test all migrations run successfully
- [ ] Test Drizzle schema generates correct types
- [ ] Test Blink validation with real usernames
- [ ] Test Fedi format validation
- [ ] Test Machankura format validation
- [ ] Test batch validation with 20+ addresses
- [ ] Test email sending via Resend
- [ ] Test email logging to database

---

## Phase B: Video Submission Form Enhancement

**Status**: ⏳ Not Started
**Duration**: 2-3 hours
**Prerequisites**: Phase A complete

### Form UI Updates

- [ ] Update `app/cbaf/videos/submit/page.tsx`
  - [ ] Add lightning address input field per merchant
    - [ ] Use existing Input component
    - [ ] Add placeholder: "john_doe or +27xxxxxxxxx"
    - [ ] Make required
  - [ ] Add payment provider dropdown per merchant
    - [ ] Options: Blink (default), Fedi, Machankura, Other
    - [ ] Use existing form styling
  - [ ] Add real-time validation indicator
    - [ ] Green checkmark for valid format
    - [ ] Red X for invalid format
    - [ ] Yellow warning for "not validated yet"
  - [ ] Update form state to include payment fields
  - [ ] Add client-side format validation
  - [ ] Update form submission handler

### Type Definitions

- [ ] Update `types/cbaf.ts` or create if missing
  - [ ] Add PaymentProvider type
  - [ ] Update VideoSubmissionForm interface
  - [ ] Add MerchantPaymentInfo interface

### API Updates

- [ ] Update `app/api/cbaf/videos/submit/route.ts`
  - [ ] Accept `merchantLightningAddresses` array in request body
  - [ ] Accept `merchantPaymentProviders` array in request body
  - [ ] Validate arrays match merchantBtcmapUrls length
  - [ ] Update merchant creation/update logic
    - [ ] Store lightning_address
    - [ ] Store payment_provider
    - [ ] Set address_verified = false
  - [ ] Update response to include payment info
  - [ ] Add error handling for missing payment data

### Testing

- [ ] Test form with single merchant + payment address
- [ ] Test form with multiple merchants
- [ ] Test different payment providers
- [ ] Test validation indicators
- [ ] Test form submission with valid data
- [ ] Test error handling (missing address)
- [ ] Verify data stored correctly in database
- [ ] Test with existing merchant (update scenario)

---

## Phase C: Admin Address Verification Interface

**Status**: ⏳ Not Started
**Duration**: 4-5 hours
**Prerequisites**: Phase B complete

### UI Components

- [ ] Create `components/cbaf/shared/ValidationStatusBadge.tsx`
  - [ ] Define props interface
  - [ ] Implement 4 states (pending, valid, invalid, validating)
  - [ ] Add icons (circle, checkmark, X, spinner)
  - [ ] Add tooltips with error details
  - [ ] Style with Bitcoin Orange + status colors
  - [ ] Test all states

- [ ] Create `components/cbaf/admin/PaymentAddressCard.tsx`
  - [ ] Define props interface (MerchantWithAddress[])
  - [ ] Create card container with heading
  - [ ] Add "Validate All Addresses" button
    - [ ] Loading state with progress
    - [ ] Success state
    - [ ] Error handling
  - [ ] Map merchants to list items
    - [ ] Merchant name + BTCMap status
    - [ ] Lightning address (monospace font)
    - [ ] Payment provider badge
    - [ ] ValidationStatusBadge
    - [ ] Error message display (if invalid)
    - [ ] Individual "Retry" button
  - [ ] Add summary bar
    - [ ] "X/Y Verified • Z Invalid • W Pending"
  - [ ] Add "Request Correction" button (shown if any invalid)
  - [ ] Implement validation logic
    - [ ] Call validation API
    - [ ] Update UI with results
    - [ ] Show toast notifications
  - [ ] Style with card utility class

- [ ] Create `components/cbaf/admin/AddressCorrectionModal.tsx`
  - [ ] Define props interface
  - [ ] Use Modal component (create if needed)
  - [ ] Show invalid merchant list
    - [ ] Table with columns: Merchant, Address, Error
  - [ ] Add email recipient field (pre-filled)
  - [ ] Add optional custom message textarea
  - [ ] Add email preview section
  - [ ] Add "Send Email" button
    - [ ] Loading state
    - [ ] Success toast
    - [ ] Error toast
  - [ ] Add "Cancel" button
  - [ ] Style with modal utilities

### Page Integration

- [ ] Update `app/cbaf/admin/reviews/[id]/page.tsx`
  - [ ] Fetch merchants with payment addresses
    - [ ] Update database query
  - [ ] Add PaymentAddressCard component
    - [ ] Place between video details and review form
  - [ ] Pass validation handlers
  - [ ] Pass email modal handlers
  - [ ] Update approve button logic
    - [ ] Disable if any addresses invalid
    - [ ] Add tooltip explaining requirement
  - [ ] Update page layout for new section

### API Endpoints

- [ ] Create `app/api/cbaf/admin/validate-addresses/route.ts`
  - [ ] Accept `videoId` in request body
  - [ ] Require admin authentication
  - [ ] Fetch all merchants for video
  - [ ] Call validation service for each merchant
    - [ ] Use batchValidateAddresses()
  - [ ] Update merchant records in database
    - [ ] Set address_verified
    - [ ] Set address_verification_error
    - [ ] Set address_verified_at
    - [ ] Set address_verified_by
  - [ ] Update video record
    - [ ] Set addresses_verified (if all valid)
    - [ ] Set invalid_addresses_count
  - [ ] Return validation results
  - [ ] Error handling

- [ ] Create `app/api/cbaf/admin/send-correction-email/route.ts`
  - [ ] Accept `videoId` and `invalidMerchantIds` in body
  - [ ] Require admin authentication
  - [ ] Fetch video + economy data
  - [ ] Fetch invalid merchants
  - [ ] Generate email content
    - [ ] Call generateAddressCorrectionEmail()
  - [ ] Send email via Resend
    - [ ] Call sendEmail()
  - [ ] Return success/error
  - [ ] Error handling

### Toast Notifications

- [ ] Install toast library if not present
  - [ ] `npm install react-hot-toast` or use existing
- [ ] Add toast container to layout
- [ ] Implement success toasts
  - [ ] "Addresses validated successfully"
  - [ ] "Correction email sent to [economy]"
- [ ] Implement error toasts
  - [ ] "Validation failed: [error]"
  - [ ] "Failed to send email: [error]"

### Testing

- [ ] Test ValidationStatusBadge all states
- [ ] Test PaymentAddressCard with 1 merchant
- [ ] Test PaymentAddressCard with 10+ merchants
- [ ] Test "Validate All" button
  - [ ] All valid scenario
  - [ ] All invalid scenario
  - [ ] Mixed valid/invalid
- [ ] Test individual validation
- [ ] Test "Request Correction" button
- [ ] Test AddressCorrectionModal
  - [ ] Email preview
  - [ ] Send functionality
  - [ ] Cancel functionality
- [ ] Test review page integration
  - [ ] Approve button disabled when invalid addresses
  - [ ] Approve enabled after fixing addresses
- [ ] Test validation API endpoint
- [ ] Test email sending API endpoint
- [ ] Test error handling (API failures)
- [ ] Test toast notifications

---

## Phase D: Super Admin Funding Updates

**Status**: ⏳ Not Started
**Duration**: 2-3 hours
**Prerequisites**: Phase C complete

### Funding Calculation Logic

- [ ] Create/update `lib/cbaf/funding.ts`
  - [ ] Update `calculateMonthlyFunding()` function
    - [ ] Query only verified merchants
    - [ ] Filter by `address_verified = true`
  - [ ] Add `getVerifiedMerchantsForEconomy()` function
    - [ ] Accept economyId, month filters
    - [ ] Return merchants with verified addresses only
  - [ ] Add verification status to funding calculations
  - [ ] Write unit tests

### Funding Calculator UI

- [ ] Update `app/cbaf/super-admin/funding/page.tsx`
  - [ ] Add "Verified Addresses Only" toggle
    - [ ] Filter funding table
  - [ ] Add verification status column to table
    - [ ] Badge for verified/unverified
  - [ ] Show address verification date
  - [ ] Add tooltip explaining verification requirement
  - [ ] Update summary statistics
    - [ ] "X economies with verified addresses"
  - [ ] Style updates

### Funding Allocation UI

- [ ] Update `app/cbaf/super-admin/funding/allocate/page.tsx`
  - [ ] Update merchant address display
    - [ ] Show merchant-level addresses instead of economy-level
  - [ ] Add verification status badges
  - [ ] Add "Verified on [date]" text
  - [ ] Show payment provider icons
  - [ ] Update allocation table columns
    - [ ] Add "Address Status" column
  - [ ] Filter out unverified addresses
  - [ ] Style updates

- [ ] Update `app/cbaf/super-admin/funding/allocate/FundingAllocationPanel.tsx`
  - [ ] Update to use merchant addresses
  - [ ] Add verification status display
  - [ ] Update allocation logic
    - [ ] Track per-merchant payments
  - [ ] Update summary calculation

### Funding Disbursement Logic

- [ ] Update disbursement processing
  - [ ] Use merchant lightning addresses
  - [ ] Track per-merchant payments (not just economy-level)
  - [ ] Update funding_disbursements table structure (if needed)
  - [ ] Add merchant_id to disbursement records (junction table?)
  - [ ] Error handling for failed merchant payments

### Funding Summary Email

- [ ] Add to `lib/email/client.ts`
  - [ ] Implement `generateFundingSummaryEmail()`
    - [ ] HTML template
    - [ ] Plain text version
    - [ ] Include merchant breakdown
    - [ ] Show payment hashes
  - [ ] Update sendEmail logic for funding context

- [ ] Create `app/api/cbaf/super-admin/send-funding-summary/route.ts`
  - [ ] Accept disbursement data
  - [ ] Generate email for each economy
  - [ ] Send batch emails
  - [ ] Error handling

### Testing

- [ ] Test funding calculator with verified merchants
- [ ] Test "Verified Addresses Only" toggle
- [ ] Test funding allocation display
- [ ] Test merchant-level address display
- [ ] Test payment processing with merchant addresses
- [ ] Test funding summary email generation
- [ ] Test batch email sending
- [ ] Verify payment tracking accuracy
- [ ] Test error scenarios (unverified addresses in funding)

---

## Phase E: Testing & Edge Cases

**Status**: ⏳ Not Started
**Duration**: 3-4 hours
**Prerequisites**: Phases A-D complete

### End-to-End Testing

- [ ] Full flow test: Happy path
  - [ ] BCE submits video with 3 merchants + addresses
  - [ ] Admin navigates to review page
  - [ ] Admin clicks "Validate All Addresses"
  - [ ] All addresses return valid
  - [ ] Admin approves video
  - [ ] BCE receives success email
  - [ ] Super admin sees verified addresses in funding
  - [ ] Super admin processes payment
  - [ ] BCE receives funding summary email

- [ ] Full flow test: Error correction path
  - [ ] BCE submits video with 3 merchants (1 invalid address)
  - [ ] Admin validates addresses
  - [ ] System marks 1 invalid
  - [ ] Admin clicks "Request Correction"
  - [ ] BCE receives correction email
  - [ ] BCE updates address (manual DB update for now)
  - [ ] Admin re-validates
  - [ ] All valid now
  - [ ] Admin approves
  - [ ] Payment processed

### Edge Case Testing

- [ ] Test: All addresses invalid
  - [ ] Approve button stays disabled
  - [ ] Clear error messages shown
  - [ ] Email sent with all merchants listed

- [ ] Test: Mixed payment providers
  - [ ] 1 Blink, 1 Fedi, 1 Machankura in same video
  - [ ] Each validates correctly
  - [ ] Super admin funding uses correct addresses

- [ ] Test: Economy missing contact email
  - [ ] Validation still works
  - [ ] Email sending fails gracefully
  - [ ] Admin sees error toast
  - [ ] Error logged to database

- [ ] Test: Email delivery failure
  - [ ] Resend API returns error
  - [ ] Error logged to email_notifications
  - [ ] Admin sees error message
  - [ ] Admin can retry

- [ ] Test: Validation API timeout
  - [ ] Blink API takes >10s
  - [ ] Frontend shows timeout error
  - [ ] User can retry individual address
  - [ ] No database corruption

- [ ] Test: Duplicate validation requests
  - [ ] Admin clicks "Validate All" twice quickly
  - [ ] Second request ignored or queued
  - [ ] No duplicate database records
  - [ ] UI shows correct state

- [ ] Test: Large batch (50+ merchants)
  - [ ] Validation completes within 30s
  - [ ] UI remains responsive
  - [ ] All addresses validated correctly
  - [ ] No memory issues

- [ ] Test: Video with existing verified merchants
  - [ ] Reusing merchant doesn't reset verification
  - [ ] Admin doesn't need to re-validate
  - [ ] Funding calculation includes existing verified addresses

### Performance Testing

- [ ] Measure validation time for 20 merchants
  - [ ] Should complete in <10 seconds
  - [ ] Optimize if needed (parallel requests)

- [ ] Measure email generation time
  - [ ] Should complete in <1 second
  - [ ] Optimize template if needed

- [ ] Measure admin review page load time
  - [ ] Should load in <2 seconds
  - [ ] Optimize queries if needed

- [ ] Measure funding calculation time
  - [ ] Should complete in <5 seconds for 100 economies
  - [ ] Optimize if needed (caching, indexes)

### Error Handling Verification

- [ ] Toast messages display correctly
- [ ] Error states don't break UI
- [ ] Retry mechanisms work
- [ ] Loading states clear on error
- [ ] Database transactions rollback on error
- [ ] Email logs errors with full context

### Documentation

- [ ] Update `docs/CBAF_USER_GUIDE.md`
  - [ ] Section on submitting payment addresses
  - [ ] Supported payment providers
  - [ ] What to do if address rejected

- [ ] Create `docs/CBAF_ADMIN_GUIDE.md`
  - [ ] How to validate addresses
  - [ ] How to send correction emails
  - [ ] How to troubleshoot validation errors
  - [ ] Best practices

- [ ] Update `docs/CBAF_API.md`
  - [ ] Document new endpoints
  - [ ] Request/response examples
  - [ ] Error codes

- [ ] Update `README.md`
  - [ ] Payment verification feature description
  - [ ] Setup instructions (Resend key)

### Bug Fixes & Optimizations

- [ ] Fix any discovered bugs during testing
- [ ] Optimize slow database queries
- [ ] Improve error messages
- [ ] Add missing loading states
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts (if applicable)

---

## 🎯 Definition of Done

### Functional Completeness
- ✅ BCE users can submit lightning addresses with videos
- ✅ System supports Blink, Fedi, Machankura, Other providers
- ✅ Admin can validate addresses in batch
- ✅ Invalid addresses highlighted with specific errors
- ✅ Admin can send correction request emails
- ✅ Emails use CBAF branding (Bitcoin Orange + Black)
- ✅ Video approval requires all addresses valid
- ✅ Super admin funding uses merchant-level verified addresses
- ✅ Payment tracking includes verification status
- ✅ BCE receives confirmation emails

### Code Quality
- ✅ TypeScript strict mode compliance
- ✅ No console errors or warnings
- ✅ All components properly typed
- ✅ Reusable components follow existing patterns
- ✅ Error boundaries implemented
- ✅ Loading states for all async operations
- ✅ Database transactions used where needed
- ✅ API endpoints properly secured (auth checks)

### UX Standards
- ✅ Loading indicators for >1s operations
- ✅ Success/error feedback for all actions
- ✅ Clear error messages (no technical jargon)
- ✅ Mobile responsive (tested on 375px width)
- ✅ Keyboard accessible
- ✅ Screen reader compatible (ARIA labels)
- ✅ Consistent with existing CBAF design

### Testing Coverage
- ✅ All happy path scenarios tested
- ✅ Edge cases handled gracefully
- ✅ Performance benchmarks met
- ✅ Error scenarios tested
- ✅ Email delivery verified
- ✅ Database integrity confirmed

### Documentation
- ✅ User guide updated
- ✅ Admin guide created
- ✅ API docs updated
- ✅ Code comments for complex logic
- ✅ Migration notes documented

---

## 🚀 Deployment Checklist

**Before Production Deploy**:

- [ ] Backup production database
- [ ] Run all migrations on staging
- [ ] Test full flow on staging
- [ ] Verify Resend production API key set
- [ ] Verify domain in Resend verified
- [ ] Update CORS settings if needed
- [ ] Monitor error logs during deploy
- [ ] Test email delivery in production
- [ ] Notify admins of new features
- [ ] Notify BCE users of new requirements

---

## 📊 Estimated Timeline

| Phase | Duration | Start Date | End Date | Status |
|-------|----------|------------|----------|--------|
| Research | 2h | [Completed] | [Completed] | ✅ Done |
| Phase A | 3-4h | TBD | TBD | ⏳ Not Started |
| Phase B | 2-3h | TBD | TBD | ⏳ Not Started |
| Phase C | 4-5h | TBD | TBD | ⏳ Not Started |
| Phase D | 2-3h | TBD | TBD | ⏳ Not Started |
| Phase E | 3-4h | TBD | TBD | ⏳ Not Started |
| **Total** | **16-21h** | TBD | TBD | 🔄 In Progress |

---

## 🎉 Post-Implementation

### Monitoring (First 2 Weeks)
- [ ] Monitor email delivery success rate (target >95%)
- [ ] Monitor validation API response times (target <3s p95)
- [ ] Track address validation success rate
- [ ] Monitor error rates in logs
- [ ] Collect admin feedback
- [ ] Collect BCE user feedback

### Potential Future Enhancements
- [ ] Bulk address editing by BCE users
- [ ] Address verification reminders (automated emails)
- [ ] Payment provider auto-detection from address format
- [ ] Lightning address QR code generation
- [ ] Address verification history/audit log
- [ ] CSV export of verified addresses
- [ ] Webhook support for external payment processors
- [ ] Multi-language email templates

---

**Last Updated**: 2025-01-XX
**Maintained By**: CBAF Development Team
