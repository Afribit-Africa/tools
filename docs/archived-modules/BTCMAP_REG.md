# Merchant Registration System & BTCMap Integration
**Documentation for External Tool Development**

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Registration Flow](#registration-flow)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [BTCMap Integration](#btcmap-integration)
6. [External Tool Requirements](#external-tool-requirements)
7. [Code Examples](#code-examples)

---

## System Overview

The merchant registration system is a multi-step workflow that allows Bitcoin-accepting businesses in Kibera, Nairobi to be added to the Afribit directory and automatically published to OpenStreetMap (OSM) and BTCMap.

### Architecture Components

```
┌─────────────────────┐
│   User Submits      │
│   Registration      │
│   Form (Website)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   API Route:        │
│   /api/merchants/   │
│   submit            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Database:   │
│   merchant_         │
│   submissions       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Admin Reviews     │
│   in Dashboard      │
│   (/admin)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Two-Step          │
│   Approval:         │
│   1. Admin Approve  │
│   2. Merchant       │
│      Confirm Email  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Publish to OSM    │
│   (Node created)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Sync to BTCMap    │
│   (Automatic via    │
│   OSM sync)         │
└─────────────────────┘
```

---

## Registration Flow

### Step 1: User Submission
**Page:** `/register` or `/merchants/register`
**File:** `app/register/page.tsx`

**Required Data:**
- Business name
- Category (restaurant, shop, etc.)
- Location (latitude, longitude)
- Address (optional but recommended)
- Phone number (optional)
- Contact email (required)
- Payment methods: Bitcoin (onchain, lightning, lightning contactless)
- Additional info (optional)

**Form Fields:**
```typescript
interface MerchantSubmission {
  businessName: string;          // Required
  categoryValue: string;         // Required (from predefined list)
  address?: string;              // Optional
  latitude: number;              // Required (from GPS or map)
  longitude: number;             // Required (from GPS or map)
  phoneNumber?: string;          // Optional
  contactEmail: string;          // Required
  paymentOnchain: boolean;       // At least one payment method required
  paymentLightning: boolean;     // At least one payment method required
  additionalInfo?: string;       // Optional
}
```

### Step 2: API Submission
**Endpoint:** `POST /api/merchants/submit`
**File:** `app/api/merchants/submit/route.ts`

**Process:**
1. Rate limiting check (10 submissions per hour per IP)
2. Data validation using Zod schema
3. Email validation
4. Coordinate validation (must be in Kibera area)
5. Duplicate check (same email or business name)
6. Insert into `merchant_submissions` table
7. Send confirmation email to merchant
8. Return submission ID

**Response:**
```json
{
  "success": true,
  "submissionId": "uuid-here",
  "message": "Thank you! Your submission has been received..."
}
```

### Step 3: Admin Review
**Page:** `/admin/submissions`
**File:** `app/admin/submissions/page.tsx`

Admins can:
- View all pending submissions
- Filter by status (pending, approved, rejected)
- See business details, location on map
- Approve or reject submissions

### Step 4: Two-Step Approval Process

#### 4a. Admin Approval
**Endpoint:** `POST /api/admin/submissions/approve`
**File:** `app/api/admin/submissions/approve/route.ts`

**Process:**
1. Admin clicks "Approve" button
2. System sets `status = 'approved'`
3. Generates unique `confirmation_token`
4. Sends confirmation email to merchant with link
5. Email contains: `/api/confirm-merchant/[token]`

**Email Contents:**
- Business details confirmation
- Location verification
- Payment methods listed
- Confirmation link (valid for 7 days)
- Edit link if details are incorrect

#### 4b. Merchant Confirmation
**Endpoint:** `GET /api/confirm-merchant/[token]`
**File:** `app/api/confirm-merchant/[token]/route.ts`

**Process:**
1. Merchant clicks link in email
2. System validates token (not expired, not already used)
3. Sets `status = 'merchant_confirmed'`
4. Records `merchant_confirmed_at` timestamp
5. Redirects to success page
6. **Triggers OSM publishing queue**

### Step 5: Publishing to OpenStreetMap

**Script:** `scripts/publish-verified-to-osm.ts`
**Can be run:** Manually or via cron job

**Process:**
1. Query all merchants with `status = 'merchant_confirmed'` and `osm_node_id IS NULL`
2. For each merchant:
   - Create OSM XML changeset
   - Generate OSM tags from merchant data
   - Submit to OSM API with OAuth credentials
   - Receive OSM node ID
   - Update database with `osm_node_id` and `osm_url`
   - Set `status = 'published'`

**OSM Tags Generated:**
```xml
<tag k="name" v="Business Name Here"/>
<tag k="amenity" v="restaurant"/> <!-- or appropriate category -->
<tag k="addr:full" v="Address Here, Kibera, Nairobi"/>
<tag k="contact:email" v="merchant@email.com"/>
<tag k="contact:phone" v="+254712345678"/>
<tag k="payment:bitcoin" v="yes"/>
<tag k="payment:lightning" v="yes"/>
<tag k="payment:onchain" v="yes"/>
<tag k="payment:lightning_contactless" v="yes"/> <!-- if applicable -->
<tag k="currency:XBT" v="yes"/>
<tag k="afribit:merchant_id" v="uuid-here"/>
<tag k="afribit:verified" v="yes"/>
<tag k="afribit:early_adopter" v="yes"/> <!-- if applicable -->
<tag k="description" v="Bitcoin-accepting business in Kibera..."/>
```

### Step 6: BTCMap Sync

**Automatic Process:**
- BTCMap automatically syncs from OpenStreetMap daily
- BTCMap queries OSM for nodes with `payment:bitcoin=yes` or `currency:XBT=yes`
- Merchants appear on BTCMap within 24-48 hours
- BTCMap URL: `https://btcmap.org/merchant/[osm_node_id]`

**Manual Sync (if needed):**
- Script: `scripts/update-btcmap-links.ts`
- Fetches merchant data from BTCMap API
- Updates database with BTCMap URLs
- Verifies sync status

---

## Database Schema

### Table: `merchant_submissions`

```sql
CREATE TABLE merchant_submissions (
  id VARCHAR(36) PRIMARY KEY,                    -- UUID
  business_name VARCHAR(255) NOT NULL,
  category_key VARCHAR(50),                      -- 'amenity' or 'shop'
  category_value VARCHAR(100) NOT NULL,          -- 'restaurant', 'cafe', etc.
  description TEXT,

  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,

  -- Contact
  phone VARCHAR(50),
  website VARCHAR(255),
  contact_email VARCHAR(255) NOT NULL,

  -- Payment Methods
  payment_onchain BOOLEAN DEFAULT FALSE,
  payment_lightning BOOLEAN DEFAULT FALSE,
  payment_lightning_contactless BOOLEAN DEFAULT FALSE,

  -- Status & Workflow
  status ENUM(
    'pending',                -- Initial submission
    'approved',               -- Admin approved, awaiting merchant confirmation
    'merchant_confirmed',     -- Merchant confirmed, ready for OSM
    'published',              -- Published to OSM
    'rejected'                -- Rejected by admin
  ) DEFAULT 'pending',

  confirmation_token VARCHAR(255),               -- For merchant confirmation
  confirmation_token_expires_at DATETIME,        -- Token expiry
  merchant_confirmed_at DATETIME,                -- When merchant confirmed
  rejection_reason TEXT,

  -- OSM Integration
  osm_node_id BIGINT,                           -- OSM node ID after publishing
  osm_changeset_id BIGINT,                      -- OSM changeset ID
  osm_url VARCHAR(500),                         -- Full OSM URL

  -- BTCMap Integration
  btcmap_synced BOOLEAN DEFAULT FALSE,
  btcmap_url VARCHAR(500),

  -- Early Adopter Program
  is_early_adopter BOOLEAN DEFAULT FALSE,
  adopter_number INT,                           -- Sequential number

  -- Verification
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_at DATETIME,
  verified_by_email VARCHAR(255),
  verification_notes TEXT,

  -- Timestamps
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  published_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_status (status),
  INDEX idx_email (contact_email),
  INDEX idx_verification (verification_status),
  INDEX idx_osm_node (osm_node_id),
  INDEX idx_confirmation_token (confirmation_token),
  INDEX idx_early_adopter (is_early_adopter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Key Status Values

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending` | Initial submission, waiting for admin review | Admin approves/rejects |
| `approved` | Admin approved, confirmation email sent | Merchant clicks confirmation link |
| `merchant_confirmed` | Merchant confirmed via email | System publishes to OSM |
| `published` | Published to OSM, sync to BTCMap | None (complete) |
| `rejected` | Admin rejected submission | None (terminal state) |

---

## API Endpoints

### 1. Submit Merchant Registration
**POST** `/api/merchants/submit`

**Request Body:**
```json
{
  "businessName": "Bitcoin Cafe",
  "categoryValue": "cafe",
  "address": "Kibera Road, Nairobi",
  "latitude": -1.31326,
  "longitude": 36.78783,
  "phoneNumber": "+254712345678",
  "contactEmail": "owner@bitcoincafe.co.ke",
  "paymentOnchain": true,
  "paymentLightning": true,
  "additionalInfo": "Open daily 8am-6pm"
}
```

**Response (Success):**
```json
{
  "success": true,
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Thank you! Your submission has been received and is under review."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Validation Rules:**
- Business name: 2-200 characters
- Email: Valid format
- Coordinates: Must be in Kibera bounds (-1.3300 to -1.3000 lat, 36.7700 to 36.8000 lon)
- At least one payment method required
- Rate limit: 10 submissions per hour per IP

### 2. Admin Approve Submission
**POST** `/api/admin/submissions/approve`

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
```

**Request Body:**
```json
{
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "adminEmail": "admin@afribit.africa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission approved. Confirmation email sent to merchant."
}
```

### 3. Merchant Confirmation
**GET** `/api/confirm-merchant/[token]`

**URL:** `/api/confirm-merchant/abc123xyz789`

**Response:**
- Redirects to `/confirm/success` on success
- Redirects to `/confirm/expired` if token expired
- Redirects to `/confirm/invalid` if token not found
- Redirects to `/confirm/already-confirmed` if already used

### 4. Get Merchant List
**GET** `/api/merchants`

**Query Parameters:**
- `status`: Filter by status (optional)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "merchants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "businessName": "Bitcoin Cafe",
      "categoryValue": "cafe",
      "latitude": -1.31326,
      "longitude": 36.78783,
      "status": "published",
      "osmUrl": "https://www.openstreetmap.org/node/12345678",
      "btcmapUrl": "https://btcmap.org/merchant/12345678",
      "isEarlyAdopter": true,
      "adopterNumber": 42
    }
  ],
  "total": 150
}
```

---

## BTCMap Integration

### How BTCMap Works

BTCMap is a global map of Bitcoin-accepting businesses that syncs from OpenStreetMap.

**Key Points:**
1. BTCMap queries OSM daily for nodes with Bitcoin payment tags
2. Tags checked: `payment:bitcoin=yes`, `payment:lightning=yes`, `currency:XBT=yes`
3. Sync happens automatically within 24-48 hours
4. BTCMap provides embeddable maps and merchant pages

### Required OSM Tags for BTCMap

**Minimum Required:**
```xml
<tag k="payment:bitcoin" v="yes"/>
<tag k="currency:XBT" v="yes"/>
```

**Recommended Tags:**
```xml
<tag k="name" v="Business Name"/>
<tag k="amenity" v="restaurant"/> <!-- or appropriate -->
<tag k="addr:full" v="Full Address"/>
<tag k="contact:email" v="email@example.com"/>
<tag k="contact:phone" v="+254712345678"/>
<tag k="payment:lightning" v="yes"/>
<tag k="payment:onchain" v="yes"/>
<tag k="description" v="Description of business"/>
```

### BTCMap API

**Endpoint:** `https://api.btcmap.org/v2/elements`

**Query Example:**
```bash
curl "https://api.btcmap.org/v2/elements?osm_json.tags.name=Bitcoin%20Cafe"
```

**Response Structure:**
```json
{
  "elements": [
    {
      "id": "node:12345678",
      "osm_json": {
        "type": "node",
        "id": 12345678,
        "lat": -1.31326,
        "lon": 36.78783,
        "tags": {
          "name": "Bitcoin Cafe",
          "amenity": "cafe",
          "payment:bitcoin": "yes",
          "payment:lightning": "yes"
        }
      },
      "tags": ["cafe", "bitcoin", "lightning"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Verification Script

To verify BTCMap sync, use:
```bash
npx tsx scripts/check-btcmap-merchants.ts
```

This script:
1. Queries BTCMap API for merchants in Kibera area
2. Matches with local database by OSM node ID
3. Updates `btcmap_synced` and `btcmap_url` fields
4. Reports sync status

---

## External Tool Requirements

If you want to create a separate tool for merchant registration, here's what you need:

### 1. Database Access

**Connection String:**
```
mysql://username:password@host:port/database
```

**Required Permissions:**
- `SELECT` on `merchant_submissions`
- `INSERT` on `merchant_submissions`
- `UPDATE` on `merchant_submissions`

### 2. Email Service

For merchant confirmation emails, you need:
- SMTP server or email API (e.g., Resend, SendGrid)
- Template for confirmation emails
- Email sending functionality

**Current Implementation:** Uses Resend API
**File:** `lib/resend-email.ts`

### 3. OSM OAuth Credentials

To publish to OpenStreetMap:

**OAuth 2.0 Setup:**
```env
OSM_CLIENT_ID=your_client_id
OSM_CLIENT_SECRET=your_client_secret
OSM_ACCESS_TOKEN=your_access_token
OSM_TOKEN_SECRET=your_token_secret
```

**Get Credentials:**
1. Go to https://www.openstreetmap.org/oauth2/applications
2. Register new application
3. Request permissions: `read_prefs`, `write_api`
4. Save client ID and secret
5. Complete OAuth flow to get access token

### 4. Coordinate Validation

Kibera boundaries (approximate):
```typescript
const KIBERA_BOUNDS = {
  minLat: -1.3300,
  maxLat: -1.3000,
  minLon: 36.7700,
  maxLon: 36.8000
};

function isInKibera(lat: number, lon: number): boolean {
  return lat >= KIBERA_BOUNDS.minLat &&
         lat <= KIBERA_BOUNDS.maxLat &&
         lon >= KIBERA_BOUNDS.minLon &&
         lon <= KIBERA_BOUNDS.maxLon;
}
```

### 5. Rate Limiting

Implement rate limiting to prevent abuse:
- 10 submissions per hour per IP address
- 3 submissions per hour per email address
- Use Redis or database tracking

---

## Code Examples

### Example 1: Submit Merchant (Node.js)

```typescript
import axios from 'axios';

async function submitMerchant(data: {
  businessName: string;
  categoryValue: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  paymentOnchain: boolean;
  paymentLightning: boolean;
  address?: string;
  phoneNumber?: string;
  additionalInfo?: string;
}) {
  try {
    const response = await axios.post(
      'https://afribit.africa/api/merchants/submit',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log('✅ Submission successful!');
      console.log('Submission ID:', response.data.submissionId);
      return response.data.submissionId;
    }
  } catch (error) {
    console.error('❌ Submission failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
submitMerchant({
  businessName: 'Bitcoin Cafe',
  categoryValue: 'cafe',
  latitude: -1.31326,
  longitude: 36.78783,
  contactEmail: 'owner@bitcoincafe.co.ke',
  paymentOnchain: true,
  paymentLightning: true,
  address: 'Kibera Road, Nairobi',
  phoneNumber: '+254712345678',
  additionalInfo: 'Open daily 8am-6pm',
});
```

### Example 2: Direct Database Insert (MySQL)

```typescript
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

async function insertMerchantDirect(connection: mysql.Connection, data: any) {
  const merchantId = uuidv4();

  const query = `
    INSERT INTO merchant_submissions (
      id, business_name, category_value, latitude, longitude,
      contact_email, payment_onchain, payment_lightning,
      address, phone, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
  `;

  await connection.execute(query, [
    merchantId,
    data.businessName,
    data.categoryValue,
    data.latitude,
    data.longitude,
    data.contactEmail,
    data.paymentOnchain,
    data.paymentLightning,
    data.address || null,
    data.phoneNumber || null,
  ]);

  return merchantId;
}
```

### Example 3: Publish to OSM (TypeScript)

```typescript
import axios from 'axios';

async function publishToOSM(merchant: {
  id: string;
  businessName: string;
  categoryValue: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  paymentOnchain: boolean;
  paymentLightning: boolean;
}) {
  // Step 1: Create changeset
  const changesetXML = `
    <osm>
      <changeset>
        <tag k="created_by" v="Afribit Registration Tool"/>
        <tag k="comment" v="Adding Bitcoin-accepting business in Kibera"/>
      </changeset>
    </osm>
  `;

  const changesetResponse = await axios.put(
    'https://api.openstreetmap.org/api/0.6/changeset/create',
    changesetXML,
    {
      headers: {
        'Content-Type': 'text/xml',
        'Authorization': `Bearer ${process.env.OSM_ACCESS_TOKEN}`,
      },
    }
  );

  const changesetId = changesetResponse.data;

  // Step 2: Create node
  const nodeXML = `
    <osm>
      <node changeset="${changesetId}" lat="${merchant.latitude}" lon="${merchant.longitude}">
        <tag k="name" v="${merchant.businessName}"/>
        <tag k="amenity" v="${merchant.categoryValue}"/>
        <tag k="contact:email" v="${merchant.contactEmail}"/>
        <tag k="payment:bitcoin" v="yes"/>
        <tag k="payment:lightning" v="${merchant.paymentLightning ? 'yes' : 'no'}"/>
        <tag k="payment:onchain" v="${merchant.paymentOnchain ? 'yes' : 'no'}"/>
        <tag k="currency:XBT" v="yes"/>
        <tag k="afribit:merchant_id" v="${merchant.id}"/>
      </node>
    </osm>
  `;

  const nodeResponse = await axios.put(
    'https://api.openstreetmap.org/api/0.6/node/create',
    nodeXML,
    {
      headers: {
        'Content-Type': 'text/xml',
        'Authorization': `Bearer ${process.env.OSM_ACCESS_TOKEN}`,
      },
    }
  );

  const nodeId = nodeResponse.data;

  // Step 3: Close changeset
  await axios.put(
    `https://api.openstreetmap.org/api/0.6/changeset/${changesetId}/close`,
    null,
    {
      headers: {
        'Authorization': `Bearer ${process.env.OSM_ACCESS_TOKEN}`,
      },
    }
  );

  return {
    osmNodeId: nodeId,
    osmChangesetId: changesetId,
    osmUrl: `https://www.openstreetmap.org/node/${nodeId}`,
  };
}
```

### Example 4: Check BTCMap Sync Status

```typescript
import axios from 'axios';

async function checkBTCMapSync(osmNodeId: number) {
  try {
    const response = await axios.get(
      `https://api.btcmap.org/v2/elements`,
      {
        params: {
          'osm_json.id': osmNodeId,
        },
      }
    );

    if (response.data.elements && response.data.elements.length > 0) {
      const element = response.data.elements[0];
      return {
        synced: true,
        btcmapUrl: `https://btcmap.org/merchant/${osmNodeId}`,
        tags: element.tags,
        lastUpdated: element.updated_at,
      };
    }

    return { synced: false };
  } catch (error) {
    console.error('BTCMap check failed:', error);
    return { synced: false, error: error.message };
  }
}
```

---

## Environment Variables

For external tool, you'll need:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# OSM API
OSM_CLIENT_ID=your_client_id
OSM_CLIENT_SECRET=your_client_secret
OSM_ACCESS_TOKEN=your_access_token
OSM_TOKEN_SECRET=your_token_secret
OSM_API_URL=https://api.openstreetmap.org/api/0.6

# Email (if using Resend)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@afribit.africa

# Application
BASE_URL=https://afribit.africa
CONFIRMATION_TOKEN_EXPIRY_HOURS=168  # 7 days
```

---

## Testing

### Test Submission
```bash
curl -X POST https://afribit.africa/api/merchants/submit \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Cafe",
    "categoryValue": "cafe",
    "latitude": -1.31326,
    "longitude": 36.78783,
    "contactEmail": "test@example.com",
    "paymentOnchain": true,
    "paymentLightning": true
  }'
```

### Test OSM Connection
```bash
npx tsx scripts/test-oauth-config.ts
```

### Test BTCMap Sync
```bash
npx tsx scripts/check-btcmap-merchants.ts
```

---

## Common Issues & Solutions

### Issue 1: Coordinates Outside Kibera
**Error:** "Location must be within Kibera area"
**Solution:** Verify coordinates are within bounds (-1.3300 to -1.3000 lat, 36.7700 to 36.8000 lon)

### Issue 2: Email Already Exists
**Error:** "A submission with this email already exists"
**Solution:** Check database for duplicate entries, allow resubmission after rejection

### Issue 3: OSM Publishing Fails
**Error:** "OSM API returned 401 Unauthorized"
**Solution:** Refresh OAuth token using `scripts/refresh-osm-token.ts`

### Issue 4: BTCMap Not Showing Merchant
**Problem:** Merchant published to OSM but not on BTCMap
**Solution:**
1. Wait 24-48 hours for automatic sync
2. Verify tags include `payment:bitcoin=yes` or `currency:XBT=yes`
3. Check BTCMap API manually
4. Run `scripts/update-btcmap-links.ts`

---

## Security Considerations

1. **Rate Limiting:** Implement per-IP and per-email rate limits
2. **Email Verification:** Validate email format and deliverability
3. **Coordinate Validation:** Ensure coordinates are within expected area
4. **SQL Injection:** Use parameterized queries
5. **Token Security:** Generate cryptographically secure confirmation tokens
6. **OSM Credentials:** Never expose in client-side code
7. **Admin Authentication:** Require JWT or session auth for admin endpoints

---

## Support & Resources

- **OpenStreetMap API:** https://wiki.openstreetmap.org/wiki/API_v0.6
- **BTCMap API:** https://btcmap.org/api-docs
- **OSM OAuth Guide:** https://wiki.openstreetmap.org/wiki/OAuth
- **Afribit GitHub:** https://github.com/Afribit-Africa/Website

---

**Document Version:** 1.0
**Last Updated:** December 7, 2024
**Contact:** For questions about integration, open an issue on GitHub
