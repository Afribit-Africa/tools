# CBAF Payment Address Verification System - Research & Design

## 📋 Executive Summary

This document outlines the research, design, and implementation plan for adding merchant-level payment address collection, verification, and error notification to the CBAF system.

**Current Gap**: System collects BTCMap URLs for proof of work but doesn't collect lightning addresses for payments. Super admin funding uses economy-level addresses instead of merchant-specific addresses.

**New Requirement**: BCE users submit lightning addresses per merchant → Admin verifies addresses → Email notifications for errors → Super admin processes verified payments.

---

## 🔍 Current System Analysis

### Existing Flow
1. BCE user submits video with `merchantBtcmapUrls[]` + `merchantLocalNames[]`
2. API creates video record, verifies BTCMap URLs, registers merchants
3. Admin reviews video, sees BTCMap verification status
4. Admin approves/rejects video
5. Super admin calculates funding using **economy-level** `lightningAddress`

### Critical Gaps
| Gap | Current State | Required State |
|-----|---------------|----------------|
| **Payment Fields** | Merchants table has no lightning address | Need `lightning_address`, `payment_provider`, `address_verified` |
| **Video Submission** | Only collects BTCMap URLs | Must collect payment addresses per merchant |
| **Admin Verification** | No address validation UI | Need verification interface with validation buttons |
| **Error Handling** | No notification system | Need email templates for address correction requests |
| **Economy Contact** | No contact email field | Need `contactEmail` for notifications |
| **Funding Flow** | Uses economy-level address | Must use merchant-level verified addresses |

---

## 🎨 Email Template Design

### Best Practices Research

**Key Findings** from industry leaders (Stripe, PayPal, Mailchimp):
- **Subject lines**: Clear, specific, action-oriented (45-60 characters)
- **Structure**: Logo → Headline → Body → Clear CTA → Footer
- **Tone**: Professional but human, concise, empathetic
- **Design**: Mobile-first, single column, minimal colors, high contrast
- **CTAs**: One primary action, button > link, clear outcome
- **Error handling**: Specific details, actionable steps, support contact

### Template 1: Address Correction Request

**Use Case**: Admin finds invalid lightning addresses, needs BCE to provide corrections.

**Subject**: Action Required: Update Payment Addresses for [Economy Name]

**Design Specifications**:
```
┌─────────────────────────────────────────┐
│ [CBAF Logo + Bitcoin Orange accent]     │
│─────────────────────────────────────────│
│                                         │
│ ⚠️ Payment Addresses Need Attention     │
│                                         │
│ Hi [Economy Name] Team,                 │
│                                         │
│ We reviewed your recent video           │
│ submission and found issues with        │
│ some merchant payment addresses.        │
│                                         │
│ Video: [Video Title]                    │
│ Submitted: [Date]                       │
│                                         │
│ ❌ Invalid Addresses:                   │
│                                         │
│ 1. [Merchant Name]                      │
│    Submitted: [address]                 │
│    Issue: [Validation error]            │
│                                         │
│ 2. [Merchant Name]                      │
│    Submitted: [address]                 │
│    Issue: [Validation error]            │
│                                         │
│ Please update these addresses so we     │
│ can process your funding request.       │
│                                         │
│ [Update Addresses Button]               │
│ → /cbaf/videos/[id]/update-merchants    │
│                                         │
│ Questions? Reply to this email or       │
│ contact admin@cbaf.org                  │
│                                         │
│ Best regards,                           │
│ CBAF Admin Team                         │
│                                         │
│─────────────────────────────────────────│
│ Circular Bitcoin Africa Fund            │
│ Building Bitcoin economies across       │
│ Africa, one merchant at a time          │
└─────────────────────────────────────────┘
```

**Technical Implementation**:
- HTML email with inline CSS (Gmail/Outlook compatibility)
- Responsive design (breakpoint at 600px)
- Bitcoin Orange (#F7931A) for CTAs and accents
- Black (#000000) for headers
- Gray scale for body text (#374151, #6B7280, #9CA3AF)
- Use React Email (react.email) or Resend templates

### Template 2: Address Verification Success

**Use Case**: All addresses validated, video approved, funding in process.

**Subject**: ✅ Video Approved - Funding Processing for [Economy Name]

**Design**:
```
┌─────────────────────────────────────────┐
│ [CBAF Logo + Bitcoin Orange accent]     │
│─────────────────────────────────────────│
│                                         │
│ ✅ Great News! Video Approved           │
│                                         │
│ Hi [Economy Name] Team,                 │
│                                         │
│ Your video submission has been          │
│ approved and all merchant payment       │
│ addresses have been verified!           │
│                                         │
│ Video: [Video Title]                    │
│ Merchants: [Count]                      │
│ Approved: [Date]                        │
│                                         │
│ ⚡ Verified Payment Addresses:          │
│                                         │
│ • [Merchant 1] → [address] (Blink)      │
│ • [Merchant 2] → [address] (Fedi)       │
│ • [Merchant 3] → [address] (Blink)      │
│                                         │
│ Next Steps:                             │
│ 1. Your submission enters the monthly   │
│    funding calculation                  │
│ 2. Super admin processes batch          │
│    payments at month-end                │
│ 3. Merchants receive funds directly     │
│                                         │
│ [View Dashboard Button]                 │
│ → /cbaf/dashboard                       │
│                                         │
│ Keep up the great work! 🧡              │
│                                         │
│ Best regards,                           │
│ CBAF Admin Team                         │
│                                         │
│─────────────────────────────────────────│
│ Circular Bitcoin Africa Fund            │
└─────────────────────────────────────────┘
```

### Template 3: Monthly Funding Summary

**Use Case**: Super admin processed payments, BCE receives summary.

**Subject**: 💰 CBAF Funding Processed for [Month] - [Economy Name]

**Design**:
```
┌─────────────────────────────────────────┐
│ [CBAF Logo + Bitcoin Orange accent]     │
│─────────────────────────────────────────│
│                                         │
│ 💰 Funding Successfully Processed       │
│                                         │
│ Hi [Economy Name] Team,                 │
│                                         │
│ Your CBAF funding for [Month] has       │
│ been processed!                         │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ Total Funded: [Amount] sats       │   │
│ │ Videos Approved: [Count]          │   │
│ │ Merchants Paid: [Count]           │   │
│ │ New Merchants: [Count]            │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Payment Breakdown:                      │
│                                         │
│ Video 1: [Title]                        │
│ • [Merchant 1]: [Amount] sats           │
│ • [Merchant 2]: [Amount] sats           │
│                                         │
│ Video 2: [Title]                        │
│ • [Merchant 3]: [Amount] sats           │
│                                         │
│ Transaction Details:                    │
│ Payment Hash: [hash]                    │
│ Timestamp: [ISO date]                   │
│                                         │
│ [View Full Report Button]               │
│ → /cbaf/dashboard/funding-history       │
│                                         │
│ Thank you for building the Bitcoin      │
│ circular economy! 🧡                    │
│                                         │
│ Best regards,                           │
│ CBAF Super Admin Team                   │
│                                         │
│─────────────────────────────────────────│
│ Circular Bitcoin Africa Fund            │
└─────────────────────────────────────────┘
```

---

## 🖥️ Admin Address Verification UI Design

### UX Research Findings

**Patterns from Stripe Connect, PayPal Verification, Coinbase Merchant Tools**:
- **Batch validation**: Verify all addresses with one click
- **Real-time feedback**: Green checkmarks, red X icons, yellow warnings
- **Inline editing**: Fix typos without navigating away
- **Provider detection**: Auto-detect Blink/Fedi/Machankura from format
- **Error specificity**: "Username not found" vs "Invalid format"
- **Bulk actions**: "Approve All Valid", "Flag All Invalid"
- **Loading states**: Spinners during validation API calls
- **Undo capability**: Reverse validation decisions

### Wireframe: Admin Review Page Enhancement

**Current Page Structure** (`/cbaf/admin/reviews/[id]`):
```
┌────────────────────────────────────────────┐
│ [Header: Back to Reviews]                  │
│────────────────────────────────────────────│
│                                            │
│ [Video Title]                              │
│ [Video Embed - YouTube/Twitter/etc]        │
│                                            │
│ [Merchant List - BTCMap Verification]      │
│ [Review Form - Approve/Reject]             │
│                                            │
└────────────────────────────────────────────┘
```

**NEW Enhanced Structure**:
```
┌────────────────────────────────────────────┐
│ [Header: Back to Reviews]                  │
│────────────────────────────────────────────│
│                                            │
│ Video Details Card                         │
│ ├─ Title, Date, Economy                    │
│ ├─ Video Embed                             │
│ └─ Status Badge                            │
│                                            │
│ ✨ NEW: Payment Address Verification Card │
│ ┌────────────────────────────────────────┐ │
│ │ Merchant Payment Addresses             │ │
│ │                                        │ │
│ │ [Validate All Addresses] Button        │ │
│ │                                        │ │
│ │ Merchant 1: Mama's Kitchen            │ │
│ │ ├─ BTCMap: ✅ Verified                │ │
│ │ ├─ Lightning: john_doe                │ │
│ │ ├─ Provider: [Blink ▼]                │ │
│ │ └─ Status: [🟡 Not Validated]         │ │
│ │                                        │ │
│ │ Merchant 2: Bitcoin Barber             │ │
│ │ ├─ BTCMap: ✅ Verified                │ │
│ │ ├─ Lightning: jane_bitcoin             │ │
│ │ ├─ Provider: [Blink ▼]                │ │
│ │ └─ Status: [✅ Valid]                  │ │
│ │                                        │ │
│ │ Merchant 3: Spaza Shop                 │ │
│ │ ├─ BTCMap: ✅ Verified                │ │
│ │ ├─ Lightning: invalid@user             │ │
│ │ ├─ Provider: [Fedi ▼]                 │ │
│ │ └─ Status: [❌ Invalid]                │ │
│ │    Error: Username not found           │ │
│ │    [Request Correction] Button         │ │
│ │                                        │ │
│ │ Summary: 1/3 Validated, 1 Error        │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Review Decision Card                       │
│ ├─ Approve (disabled if addresses invalid) │
│ ├─ Reject                                  │
│ └─ Comments Textarea                       │
│                                            │
└────────────────────────────────────────────┘
```

### Component Specifications

#### 1. PaymentAddressCard Component

**File**: `components/cbaf/admin/PaymentAddressCard.tsx`

**Props**:
```typescript
interface PaymentAddressCardProps {
  merchants: MerchantWithAddress[];
  onValidateAll: () => Promise<void>;
  onValidateOne: (merchantId: string) => Promise<void>;
  onRequestCorrection: (merchantIds: string[]) => Promise<void>;
  isValidating: boolean;
}

interface MerchantWithAddress {
  id: string;
  merchantName: string;
  btcmapVerified: boolean;
  lightningAddress: string;
  paymentProvider: 'blink' | 'fedi' | 'machankura' | 'other';
  addressVerified: boolean;
  addressVerificationError?: string;
}
```

**Features**:
- **Batch Validation Button**: Validates all addresses in one click
- **Individual Status Icons**:
  - 🟡 Yellow circle = Not yet validated
  - ✅ Green checkmark = Valid address
  - ❌ Red X = Invalid address
  - ⏳ Spinner = Validating...
- **Provider Dropdown**: Blink (default), Fedi, Machankura, Other
- **Error Display**: Inline error message below invalid addresses
- **Edit Capability**: Click address to edit inline (optional Phase 2)
- **Request Correction Button**: Opens email modal for flagged addresses
- **Summary Bar**: "2/5 Verified • 1 Invalid • 2 Pending"

#### 2. ValidationStatusBadge Component

**File**: `components/cbaf/shared/ValidationStatusBadge.tsx`

**Props**:
```typescript
interface ValidationStatusBadgeProps {
  status: 'pending' | 'valid' | 'invalid' | 'validating';
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Visual States**:
- `pending`: Gray badge with "⏸ Not Validated"
- `valid`: Green badge with "✅ Verified"
- `invalid`: Red badge with "❌ Invalid" + tooltip with error
- `validating`: Blue badge with spinner + "⏳ Checking..."

#### 3. AddressCorrectionModal Component

**File**: `components/cbaf/admin/AddressCorrectionModal.tsx`

**Props**:
```typescript
interface AddressCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  economy: {
    id: string;
    economyName: string;
    contactEmail: string;
  };
  merchants: {
    merchantName: string;
    submittedAddress: string;
    validationError: string;
  }[];
  onSendEmail: (recipients: string[], customMessage?: string) => Promise<void>;
}
```

**Features**:
- **Recipient Field**: Pre-filled with economy contact email
- **Merchant List**: Table showing invalid addresses + errors
- **Email Preview**: Shows formatted email template before sending
- **Custom Message**: Optional textarea for admin notes
- **Send Button**: Triggers email via Resend API
- **Success/Error Toast**: Confirmation after send

---

## 🗄️ Database Schema Updates

### 1. Merchants Table - Add Payment Fields

**Migration**: `migrations/add_payment_fields_to_merchants.sql`

```sql
-- Add payment address columns to merchants table
ALTER TABLE merchants ADD COLUMN lightning_address VARCHAR(255);
ALTER TABLE merchants ADD COLUMN payment_provider VARCHAR(50) DEFAULT 'blink';
  -- Enum: 'blink', 'fedi', 'machankura', 'other'
ALTER TABLE merchants ADD COLUMN address_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE merchants ADD COLUMN address_verification_error TEXT;
ALTER TABLE merchants ADD COLUMN address_verified_at TIMESTAMPTZ;
ALTER TABLE merchants ADD COLUMN address_verified_by UUID REFERENCES admin_users(id);

-- Add index for address validation queries
CREATE INDEX merchant_address_verified_idx ON merchants(address_verified);
CREATE INDEX merchant_payment_provider_idx ON merchants(payment_provider);

-- Add constraint to ensure provider is one of allowed values
ALTER TABLE merchants ADD CONSTRAINT payment_provider_check
  CHECK (payment_provider IN ('blink', 'fedi', 'machankura', 'other'));
```

**Drizzle Schema Update** (`lib/db/schema.ts`):
```typescript
export const merchants = pgTable('merchants', {
  // ... existing fields ...

  // Payment Details (NEW)
  lightningAddress: text('lightning_address'),
  paymentProvider: text('payment_provider')
    .$type<'blink' | 'fedi' | 'machankura' | 'other'>()
    .default('blink'),
  addressVerified: boolean('address_verified').default(false),
  addressVerificationError: text('address_verification_error'),
  addressVerifiedAt: timestamp('address_verified_at'),
  addressVerifiedBy: uuid('address_verified_by')
    .references(() => adminUsers.id),

  // ... rest of schema ...
}, (table) => ({
  // ... existing indexes ...
  addressVerifiedIdx: index('merchant_address_verified_idx').on(table.addressVerified),
  paymentProviderIdx: index('merchant_payment_provider_idx').on(table.paymentProvider),
}));
```

### 2. Economies Table - Add Contact Email

**Migration**: `migrations/add_contact_email_to_economies.sql`

```sql
-- Add contact email for notifications
ALTER TABLE economies ADD COLUMN contact_email VARCHAR(255);

-- Backfill with googleEmail for existing records
UPDATE economies SET contact_email = google_email WHERE contact_email IS NULL;

-- Make required after backfill
ALTER TABLE economies ALTER COLUMN contact_email SET NOT NULL;

-- Add index
CREATE INDEX economy_contact_email_idx ON economies(contact_email);
```

**Drizzle Schema Update**:
```typescript
export const economies = pgTable('economies', {
  // ... existing fields ...

  // Contact Info
  website: text('website'),
  twitter: text('twitter'),
  telegram: text('telegram'),
  contactEmail: text('contact_email').notNull(), // NEW - for notifications

  // ... rest of schema ...
}, (table) => ({
  // ... existing indexes ...
  contactEmailIdx: index('economy_contact_email_idx').on(table.contactEmail),
}));
```

### 3. Video Submissions Table - Add Address Review Status

**Migration**: `migrations/add_address_review_to_videos.sql`

```sql
-- Add payment address review status
ALTER TABLE video_submissions ADD COLUMN addresses_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE video_submissions ADD COLUMN addresses_verified_at TIMESTAMPTZ;
ALTER TABLE video_submissions ADD COLUMN invalid_addresses_count INTEGER DEFAULT 0;

-- Add index
CREATE INDEX video_addresses_verified_idx ON video_submissions(addresses_verified);
```

**Drizzle Schema Update**:
```typescript
export const videoSubmissions = pgTable('video_submissions', {
  // ... existing fields ...

  // Payment Address Verification (NEW)
  addressesVerified: boolean('addresses_verified').default(false),
  addressesVerifiedAt: timestamp('addresses_verified_at'),
  invalidAddressesCount: integer('invalid_addresses_count').default(0),

  // ... rest of schema ...
}, (table) => ({
  // ... existing indexes ...
  addressesVerifiedIdx: index('video_addresses_verified_idx').on(table.addressesVerified),
}));
```

### 4. Email Notifications Table (New)

**Migration**: `migrations/create_email_notifications_table.sql`

```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),

  -- Email Details
  template_type VARCHAR(50) NOT NULL,
    -- 'address_correction_request', 'address_verified', 'funding_processed'
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,

  -- Context
  economy_id UUID REFERENCES economies(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_submissions(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending', 'sent', 'failed', 'bounced'
  error_message TEXT,

  -- Provider Details (Resend)
  provider_message_id TEXT,

  -- Metadata
  sent_by UUID REFERENCES admin_users(id),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX email_recipient_idx ON email_notifications(recipient_email);
CREATE INDEX email_status_idx ON email_notifications(status);
CREATE INDEX email_template_idx ON email_notifications(template_type);
CREATE INDEX email_economy_idx ON email_notifications(economy_id);
CREATE INDEX email_sent_at_idx ON email_notifications(sent_at);
```

**Drizzle Schema**:
```typescript
export const emailNotifications = pgTable('email_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),

  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name'),

  templateType: text('template_type')
    .notNull()
    .$type<'address_correction_request' | 'address_verified' | 'funding_processed'>(),
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  textBody: text('text_body'),

  economyId: uuid('economy_id').references(() => economies.id, { onDelete: 'cascade' }),
  videoId: uuid('video_id').references(() => videoSubmissions.id, { onDelete: 'cascade' }),

  status: text('status')
    .notNull()
    .$type<'pending' | 'sent' | 'failed' | 'bounced'>()
    .default('pending'),
  errorMessage: text('error_message'),

  providerMessageId: text('provider_message_id'),

  sentBy: uuid('sent_by').references(() => adminUsers.id),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  recipientIdx: index('email_recipient_idx').on(table.recipientEmail),
  statusIdx: index('email_status_idx').on(table.status),
  templateIdx: index('email_template_idx').on(table.templateType),
  economyIdx: index('email_economy_idx').on(table.economyId),
  sentAtIdx: index('email_sent_at_idx').on(table.sentAt),
}));

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type NewEmailNotification = typeof emailNotifications.$inferInsert;
```

---

## 🔧 Payment Provider Validation Research

### Existing: Blink Validation

**Already Implemented**: `lib/blink/client.ts`

```typescript
export async function verifyBlinkAddress(username: string): Promise<BlinkVerificationResult> {
  try {
    const data = await blinkClient.request<{
      accountDefaultWallet: {
        id: string;
        walletCurrency: string;
      };
    }>(ACCOUNT_DEFAULT_WALLET_QUERY, { username });

    return {
      valid: true,
      walletId: data.accountDefaultWallet.id,
      walletCurrency: data.accountDefaultWallet.walletCurrency,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.errors?.[0]?.message || 'Address not found',
    };
  }
}
```

**API Endpoint**: `https://api.blink.sv/graphql`
**Format**: Usernames like `john_doe`, `mama_bitcoin`
**Validation**: GraphQL query `accountDefaultWallet(username: $username)`

### TODO: Fedi Validation

**Research Needed**: Fedi lightning address format and validation API

**Expected Format** (from Fedi docs research):
- Lightning addresses: `user@fedi.xyz` or Fedimint-specific format
- May require federation ID + username pattern

**Implementation Plan**:
1. Research Fedi lightning address docs
2. Identify validation endpoint (if public API exists)
3. If no API: validate format only (regex pattern)
4. Create `lib/fedi/client.ts` with `verifyFediAddress()`
5. Add to unified validation service

**Fallback**: Format validation only
```typescript
export function validateFediFormat(address: string): { valid: boolean; error?: string } {
  // Pattern: user@federation.fedi.xyz or similar
  const fediPattern = /^[a-z0-9_-]+@[a-z0-9.-]+\.fedi(\.xyz)?$/i;
  return {
    valid: fediPattern.test(address),
    error: !fediPattern.test(address) ? 'Invalid Fedi address format' : undefined,
  };
}
```

### TODO: Machankura Validation

**Research Needed**: Machankura lightning address format

**Expected Format** (from Machankura research):
- USSD-based: `+27XXXXXXXXX` (South African phone numbers)
- Lightning addresses may use phone number format

**Implementation Plan**:
1. Research Machankura address structure
2. Check if validation API exists
3. Likely phone number validation: `+27`, `+254`, `+256` prefixes
4. Create `lib/machankura/client.ts`

**Fallback**: Phone number format validation
```typescript
export function validateMachankuraFormat(phone: string): { valid: boolean; error?: string } {
  // Pattern: +27, +254, +256 (SA, Kenya, Uganda)
  const phonePattern = /^\+(?:27|254|256)\d{9}$/;
  return {
    valid: phonePattern.test(phone),
    error: !phonePattern.test(phone) ? 'Invalid phone number format' : undefined,
  };
}
```

### Unified Validation Service

**File**: `lib/payment/validator.ts`

```typescript
import { verifyBlinkAddress } from '@/lib/blink/client';
import { validateFediFormat } from '@/lib/fedi/client';
import { validateMachankuraFormat } from '@/lib/machankura/client';

export type PaymentProvider = 'blink' | 'fedi' | 'machankura' | 'other';

export interface PaymentValidationResult {
  valid: boolean;
  provider: PaymentProvider;
  address: string;
  error?: string;
  metadata?: {
    walletId?: string;
    walletCurrency?: string;
  };
}

export async function validatePaymentAddress(
  address: string,
  provider: PaymentProvider
): Promise<PaymentValidationResult> {

  // Sanitize
  const cleaned = address.trim().toLowerCase();

  switch (provider) {
    case 'blink':
      const blinkResult = await verifyBlinkAddress(cleaned);
      return {
        valid: blinkResult.valid,
        provider: 'blink',
        address: cleaned,
        error: blinkResult.error,
        metadata: {
          walletId: blinkResult.walletId,
          walletCurrency: blinkResult.walletCurrency,
        },
      };

    case 'fedi':
      const fediResult = validateFediFormat(cleaned);
      return {
        valid: fediResult.valid,
        provider: 'fedi',
        address: cleaned,
        error: fediResult.error,
      };

    case 'machankura':
      const machankuraResult = validateMachankuraFormat(cleaned);
      return {
        valid: machankuraResult.valid,
        provider: 'machankura',
        address: cleaned,
        error: machankuraResult.error,
      };

    case 'other':
      // For "other", just check it's not empty
      return {
        valid: cleaned.length > 0,
        provider: 'other',
        address: cleaned,
        error: cleaned.length === 0 ? 'Address cannot be empty' : undefined,
      };

    default:
      return {
        valid: false,
        provider,
        address: cleaned,
        error: 'Unsupported payment provider',
      };
  }
}

// Batch validation
export async function batchValidateAddresses(
  addresses: Array<{ address: string; provider: PaymentProvider }>,
  onProgress?: (completed: number, total: number) => void
): Promise<PaymentValidationResult[]> {
  const results: PaymentValidationResult[] = [];
  const batchSize = 10;

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(item => validatePaymentAddress(item.address, item.provider))
    );

    results.push(
      ...batchResults.map(result =>
        result.status === 'fulfilled'
          ? result.value
          : {
              valid: false,
              provider: 'other' as PaymentProvider,
              address: '',
              error: 'Validation failed',
            }
      )
    );

    if (onProgress) {
      onProgress(Math.min(i + batchSize, addresses.length), addresses.length);
    }

    // Rate limiting delay
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
```

---

## 📧 Email Service Integration

### Recommended Service: Resend

**Why Resend?**
- ✅ Built for Next.js (official partner)
- ✅ React Email template support
- ✅ Simple API, great DX
- ✅ 100 emails/day free tier (sufficient for CBAF)
- ✅ Webhook support for open/click tracking
- ✅ Good deliverability

**Setup Steps**:
1. Sign up at resend.com
2. Verify domain (cbaf.org or afribitools subdomain)
3. Get API key
4. Add to `.env`: `RESEND_API_KEY=re_xxx`
5. Install: `npm install resend react-email`

### Email Service Implementation

**File**: `lib/email/client.ts`

```typescript
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { emailNotifications, economies, adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateType: 'address_correction_request' | 'address_verified' | 'funding_processed';
  economyId?: string;
  videoId?: string;
  sentByAdminId?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'CBAF Admin <admin@cbaf.org>',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error('Resend error:', error);

      // Log failed email to database
      await db.insert(emailNotifications).values({
        recipientEmail: params.to,
        recipientName: params.toName,
        templateType: params.templateType,
        subject: params.subject,
        htmlBody: params.html,
        textBody: params.text,
        economyId: params.economyId,
        videoId: params.videoId,
        status: 'failed',
        errorMessage: error.message,
        sentBy: params.sentByAdminId,
      });

      return { success: false, error: error.message };
    }

    // Log successful email to database
    await db.insert(emailNotifications).values({
      recipientEmail: params.to,
      recipientName: params.toName,
      templateType: params.templateType,
      subject: params.subject,
      htmlBody: params.html,
      textBody: params.text,
      economyId: params.economyId,
      videoId: params.videoId,
      status: 'sent',
      providerMessageId: data?.id,
      sentBy: params.sentByAdminId,
      sentAt: new Date(),
    });

    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Template functions
export function generateAddressCorrectionEmail(params: {
  economyName: string;
  videoTitle: string;
  submittedDate: string;
  invalidMerchants: Array<{
    merchantName: string;
    submittedAddress: string;
    validationError: string;
  }>;
  updateUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Action Required: Update Payment Addresses for ${params.economyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #374151; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .accent { color: #F7931A; }
        .content { background: #fff; padding: 30px; border: 1px solid #E5E7EB; }
        .alert { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        .merchant-error { background: #FEE2E2; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .merchant-name { font-weight: 600; color: #1F2937; margin-bottom: 5px; }
        .address { font-family: monospace; color: #6B7280; font-size: 13px; }
        .error-msg { color: #DC2626; font-size: 14px; margin-top: 5px; }
        .button { display: inline-block; background: #F7931A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CBAF <span class="accent">⚡</span></div>
        </div>

        <div class="content">
          <h1 style="color: #1F2937; margin-top: 0;">⚠️ Payment Addresses Need Attention</h1>

          <p>Hi ${params.economyName} Team,</p>

          <p>We reviewed your recent video submission and found issues with some merchant payment addresses.</p>

          <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Video:</strong> ${params.videoTitle}<br>
            <strong>Submitted:</strong> ${params.submittedDate}
          </div>

          <h2 style="color: #DC2626; font-size: 18px;">❌ Invalid Addresses:</h2>

          ${params.invalidMerchants.map(m => `
            <div class="merchant-error">
              <div class="merchant-name">${m.merchantName}</div>
              <div class="address">Submitted: ${m.submittedAddress}</div>
              <div class="error-msg">Issue: ${m.validationError}</div>
            </div>
          `).join('')}

          <p>Please update these addresses so we can process your funding request.</p>

          <a href="${params.updateUrl}" class="button">Update Addresses</a>

          <p style="font-size: 14px; color: #6B7280;">
            Questions? Reply to this email or contact admin@cbaf.org
          </p>

          <p>Best regards,<br>
          <strong>CBAF Admin Team</strong></p>
        </div>

        <div class="footer">
          <strong>Circular Bitcoin Africa Fund</strong><br>
          Building Bitcoin economies across Africa, one merchant at a time
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CBAF - Payment Addresses Need Attention

Hi ${params.economyName} Team,

We reviewed your recent video submission and found issues with some merchant payment addresses.

Video: ${params.videoTitle}
Submitted: ${params.submittedDate}

INVALID ADDRESSES:

${params.invalidMerchants.map(m => `
${m.merchantName}
Submitted: ${m.submittedAddress}
Issue: ${m.validationError}
`).join('\n')}

Please update these addresses: ${params.updateUrl}

Questions? Reply to this email or contact admin@cbaf.org

Best regards,
CBAF Admin Team

---
Circular Bitcoin Africa Fund
Building Bitcoin economies across Africa, one merchant at a time
  `;

  return { subject, html, text };
}

export function generateAddressVerifiedEmail(params: {
  economyName: string;
  videoTitle: string;
  merchantCount: number;
  approvedDate: string;
  merchants: Array<{
    merchantName: string;
    lightningAddress: string;
    provider: string;
  }>;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `✅ Video Approved - Funding Processing for ${params.economyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #374151; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .accent { color: #F7931A; }
        .content { background: #fff; padding: 30px; border: 1px solid #E5E7EB; }
        .success-banner { background: #D1FAE5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
        .merchant-list { background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .merchant-item { padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
        .merchant-item:last-child { border-bottom: none; }
        .button { display: inline-block; background: #F7931A; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CBAF <span class="accent">⚡</span></div>
        </div>

        <div class="content">
          <h1 style="color: #10B981; margin-top: 0;">✅ Great News! Video Approved</h1>

          <p>Hi ${params.economyName} Team,</p>

          <p>Your video submission has been approved and all merchant payment addresses have been verified!</p>

          <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Video:</strong> ${params.videoTitle}<br>
            <strong>Merchants:</strong> ${params.merchantCount}<br>
            <strong>Approved:</strong> ${params.approvedDate}
          </div>

          <h2 style="color: #1F2937; font-size: 18px;">⚡ Verified Payment Addresses:</h2>

          <div class="merchant-list">
            ${params.merchants.map(m => `
              <div class="merchant-item">
                • ${m.merchantName} → <code>${m.lightningAddress}</code> (${m.provider})
              </div>
            `).join('')}
          </div>

          <h3 style="color: #1F2937; font-size: 16px;">Next Steps:</h3>
          <ol style="padding-left: 20px;">
            <li>Your submission enters the monthly funding calculation</li>
            <li>Super admin processes batch payments at month-end</li>
            <li>Merchants receive funds directly</li>
          </ol>

          <a href="${params.dashboardUrl}" class="button">View Dashboard</a>

          <p style="margin-top: 30px;">Keep up the great work! 🧡</p>

          <p>Best regards,<br>
          <strong>CBAF Admin Team</strong></p>
        </div>

        <div class="footer">
          <strong>Circular Bitcoin Africa Fund</strong><br>
          Building Bitcoin economies across Africa, one merchant at a time
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CBAF - Video Approved!

Hi ${params.economyName} Team,

Your video submission has been approved and all merchant payment addresses have been verified!

Video: ${params.videoTitle}
Merchants: ${params.merchantCount}
Approved: ${params.approvedDate}

VERIFIED PAYMENT ADDRESSES:

${params.merchants.map(m => `• ${m.merchantName} → ${m.lightningAddress} (${m.provider})`).join('\n')}

NEXT STEPS:
1. Your submission enters the monthly funding calculation
2. Super admin processes batch payments at month-end
3. Merchants receive funds directly

View Dashboard: ${params.dashboardUrl}

Keep up the great work! 🧡

Best regards,
CBAF Admin Team

---
Circular Bitcoin Africa Fund
Building Bitcoin economies across Africa, one merchant at a time
  `;

  return { subject, html, text };
}
```

**API Endpoint**: `app/api/cbaf/admin/send-correction-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { economies, videoSubmissions, merchants } from '@/lib/db/schema';
import { sendEmail, generateAddressCorrectionEmail } from '@/lib/email/client';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { videoId, invalidMerchantIds } = body;

    // Fetch video + economy
    const video = await db.query.videoSubmissions.findFirst({
      where: eq(videoSubmissions.id, videoId),
      with: {
        economy: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Fetch invalid merchants
    const invalidMerchants = await db.query.merchants.findMany({
      where: (merchants, { inArray }) => inArray(merchants.id, invalidMerchantIds),
    });

    // Generate email
    const emailContent = generateAddressCorrectionEmail({
      economyName: video.economy.economyName,
      videoTitle: video.videoTitle || 'Untitled Video',
      submittedDate: new Date(video.submittedAt).toLocaleDateString(),
      invalidMerchants: invalidMerchants.map(m => ({
        merchantName: m.merchantName || m.localName || 'Unknown',
        submittedAddress: m.lightningAddress || 'Not provided',
        validationError: m.addressVerificationError || 'Invalid address',
      })),
      updateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cbaf/videos/${videoId}/update-merchants`,
    });

    // Send email
    const result = await sendEmail({
      to: video.economy.contactEmail,
      toName: video.economy.economyName,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      templateType: 'address_correction_request',
      economyId: video.economyId,
      videoId: video.id,
      sentByAdminId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Send correction email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Button & UX Design Patterns

### Research Findings: Admin Action Buttons

**Patterns from Stripe Dashboard, GitHub Admin, Vercel Dashboard**:

1. **Primary Action (Approve)**:
   - Bitcoin Orange background (#F7931A)
   - White text, bold weight
   - Large size, prominent placement
   - Disabled state when addresses invalid
   - Loading spinner during API call
   - Success checkmark animation on completion

2. **Secondary Action (Validate Addresses)**:
   - White background, Bitcoin Orange border
   - Bitcoin Orange text
   - Medium size
   - Loading state with progress indicator
   - Changes to "Re-validate" after first run

3. **Destructive Action (Reject)**:
   - White background, Red border (#DC2626)
   - Red text
   - Requires confirmation modal
   - Textarea for rejection reason

4. **Utility Action (Request Correction)**:
   - Gray background (#F3F4F6)
   - Gray text (#6B7280)
   - Small size, inline with errors
   - Opens modal, doesn't navigate away

### Button State Management

```typescript
// Button states
type ButtonState = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

interface ButtonProps {
  state: ButtonState;
  onClick: () => void | Promise<void>;
  label: string;
  loadingLabel?: string;
  successLabel?: string;
  icon?: React.ComponentType;
}

// Visual states
const buttonStates = {
  idle: 'bg-bitcoin-600 hover:bg-bitcoin-700 cursor-pointer',
  loading: 'bg-bitcoin-400 cursor-wait opacity-75',
  success: 'bg-green-600 cursor-default',
  error: 'bg-red-600 cursor-default',
  disabled: 'bg-gray-300 cursor-not-allowed opacity-50',
};
```

### Validation Flow UX

**Step-by-step interaction**:

1. **Initial State**:
   - "Validate All Addresses" button (white, orange border)
   - All merchant addresses show gray "Not Validated" badge

2. **Click Validate**:
   - Button changes to "Validating... 2/5" with spinner
   - Each address shows spinner as it validates
   - Real-time updates: ✅ or ❌ appear

3. **Results Display**:
   - Summary updates: "3 Valid • 2 Invalid"
   - Invalid addresses highlighted in red
   - Error messages shown inline
   - "Request Correction" button appears for invalid addresses

4. **Approve Decision**:
   - If all valid: "Approve Video" button enabled (orange)
   - If any invalid: "Approve Video" disabled (gray)
   - Tooltip explains: "Fix invalid addresses before approving"

5. **Request Correction**:
   - Click opens modal
   - Pre-filled email recipient
   - Shows invalid addresses list
   - "Send Email" button
   - Success toast: "Correction request sent to [email]"

### Loading & Error States

**Loading Indicators**:
- Spinner for single operations (<2s expected)
- Progress bar for batch operations (>2s)
- Skeleton loaders for data fetching
- Optimistic UI updates where safe

**Error Handling**:
- Inline errors below field (red text, icon)
- Toast notifications for API errors (top-right)
- Validation errors don't block navigation
- "Retry" buttons for failed operations

---

## 📋 Implementation Phases

### Phase A: Foundation (Database + Validation Infrastructure)

**Duration**: 3-4 hours

**Tasks**:
1. ✅ Create database migrations
   - Add payment fields to merchants
   - Add contact_email to economies
   - Add address review fields to videos
   - Create email_notifications table
2. ✅ Update Drizzle schema definitions
3. ✅ Run migrations on dev database
4. ✅ Test schema changes
5. ✅ Create payment validation service
   - Implement unified validator
   - Add Fedi format validation
   - Add Machankura format validation
   - Write unit tests
6. ✅ Setup Resend email service
   - Create account, verify domain
   - Implement email client
   - Create email templates
   - Test email sending

**Deliverables**:
- `migrations/` - 4 SQL migration files
- `lib/db/schema.ts` - Updated schema
- `lib/payment/validator.ts` - Validation service
- `lib/email/client.ts` - Email service
- `.env` - RESEND_API_KEY added

---

### Phase B: Video Submission Form Enhancement

**Duration**: 2-3 hours

**Tasks**:
1. ✅ Update video submission form UI
   - Add lightning address input per merchant
   - Add payment provider dropdown
   - Add real-time validation indicator
2. ✅ Update form state management
   - Add payment address fields to form data
   - Handle validation responses
3. ✅ Update video submission API
   - Accept merchantLightningAddresses array
   - Accept merchantPaymentProviders array
   - Store payment data in merchants table
4. ✅ Add client-side validation
   - Format validation before submit
   - Visual feedback (green/red indicators)
5. ✅ Test end-to-end submission

**Deliverables**:
- `app/cbaf/videos/submit/page.tsx` - Enhanced form
- `app/api/cbaf/videos/submit/route.ts` - Updated API
- Updated types in `types/cbaf.ts`

---

### Phase C: Admin Address Verification Interface

**Duration**: 4-5 hours

**Tasks**:
1. ✅ Create PaymentAddressCard component
   - Display all merchants with addresses
   - Show validation status badges
   - Validate All button
   - Individual validation buttons
2. ✅ Create ValidationStatusBadge component
   - 4 states: pending, valid, invalid, validating
   - Tooltips with error details
3. ✅ Create AddressCorrectionModal component
   - Invalid merchant list
   - Email preview
   - Send email action
4. ✅ Update admin review page
   - Integrate PaymentAddressCard
   - Update approve logic (require verified addresses)
   - Add validation API calls
5. ✅ Create validation API endpoint
   - `POST /api/cbaf/admin/validate-addresses`
   - Batch validate all merchants for a video
   - Update database with results
6. ✅ Create email sending API endpoint
   - `POST /api/cbaf/admin/send-correction-email`
   - Generate and send correction request
7. ✅ Add toast notifications
   - Success/error feedback
8. ✅ Test full workflow

**Deliverables**:
- `components/cbaf/admin/PaymentAddressCard.tsx`
- `components/cbaf/shared/ValidationStatusBadge.tsx`
- `components/cbaf/admin/AddressCorrectionModal.tsx`
- `app/cbaf/admin/reviews/[id]/page.tsx` - Enhanced
- `app/api/cbaf/admin/validate-addresses/route.ts`
- `app/api/cbaf/admin/send-correction-email/route.ts`

---

### Phase D: Super Admin Funding Updates

**Duration**: 2-3 hours

**Tasks**:
1. ✅ Update funding calculation logic
   - Query only verified merchants
   - Show verification status in funding table
2. ✅ Add "Verified Addresses Only" filter
   - Toggle to show/hide unverified
3. ✅ Update funding allocation UI
   - Display merchant-level addresses
   - Show address verification date
   - Add verification status column
4. ✅ Update funding disbursement logic
   - Use merchant addresses, not economy address
   - Track per-merchant payments
5. ✅ Add funding summary email
   - Send to economy after payment processing
   - Include merchant breakdown

**Deliverables**:
- `app/cbaf/super-admin/funding/page.tsx` - Updated calculator
- `app/cbaf/super-admin/funding/allocate/page.tsx` - Updated table
- `lib/cbaf/funding.ts` - Updated calculation logic
- Email template for funding summary

---

### Phase E: Testing & Edge Cases

**Duration**: 3-4 hours

**Tasks**:
1. ✅ End-to-end testing
   - BCE submits video with addresses
   - Admin validates addresses (mix of valid/invalid)
   - Admin sends correction request email
   - BCE updates addresses
   - Admin re-validates
   - Admin approves video
   - Super admin processes funding
2. ✅ Edge case testing
   - All addresses invalid
   - Mixed providers (Blink + Fedi + Machankura)
   - Missing contact email on economy
   - Email delivery failures
   - Validation API timeouts
   - Duplicate validation requests
3. ✅ Error handling verification
   - Toast messages work
   - Error states display correctly
   - Retry mechanisms functional
4. ✅ Performance testing
   - Batch validation with 50+ merchants
   - Email queue processing
   - Database query optimization
5. ✅ Documentation
   - Update user guide for BCE users
   - Admin guide for address verification
   - API documentation

**Deliverables**:
- Test results document
- Bug fixes
- Performance optimizations
- Updated documentation in `docs/`

---

## 🎯 Success Metrics

### Functional Requirements
- ✅ BCE users can submit lightning addresses with videos
- ✅ System supports Blink, Fedi, Machankura, Other
- ✅ Admin can validate addresses in one click
- ✅ Invalid addresses are highlighted with error messages
- ✅ Admin can send correction request emails
- ✅ Emails use CBAF branding (Bitcoin Orange + Black)
- ✅ Video approval requires all addresses valid
- ✅ Super admin funding uses merchant-level addresses
- ✅ Payment tracking shows verification status

### UX Requirements
- ✅ Loading states for all async operations
- ✅ Real-time validation feedback
- ✅ Clear error messages
- ✅ One-click batch operations
- ✅ Mobile-responsive UI
- ✅ Accessible (keyboard nav, screen readers)

### Performance Requirements
- ✅ Validation completes within 5 seconds for 20 merchants
- ✅ Email sends within 3 seconds
- ✅ Page load times <2 seconds
- ✅ No blocking operations in UI

### Quality Requirements
- ✅ TypeScript strict mode compliance
- ✅ Component reusability
- ✅ Error boundary implementation
- ✅ Logging for debugging
- ✅ Database transaction safety

---

## 📚 Next Steps

1. **Review this document** with stakeholder
2. **Approve design decisions** (email templates, UI wireframes, database schema)
3. **Set up Resend account** and domain verification
4. **Begin Phase A** (Foundation) implementation
5. **Iterative feedback** after each phase

---

## 📖 References

- [Resend Documentation](https://resend.com/docs)
- [React Email](https://react.email/)
- [Blink API Docs](https://dev.blink.sv/)
- [Stripe Design System](https://stripe.com/docs/payments)
- [Tailwind UI Patterns](https://tailwindui.com/)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Author**: GitHub Copilot
**Status**: Ready for Implementation
