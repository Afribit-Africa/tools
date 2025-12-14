# Economy Detail Pages - Implementation Plan

## Current Issues

### 1. **Admin Login Problem** (spiraedmunds@gmail.com)
**Status**: Email is in `.env` but user may not exist in database
**Root Cause**: Admin users are created on first sign-in, but if sign-in failed, no record exists

**Solution**:
```sql
-- Check if admin user exists
SELECT * FROM admin_users WHERE google_email = 'spiraedmunds@gmail.com';

-- If not exists, manually create (run after first successful Google OAuth):
INSERT INTO admin_users (
  google_id, google_email, google_name, role,
  can_approve_videos, can_reject_videos,
  can_send_payments, can_manage_admins, is_active
) VALUES (
  'GOOGLE_ID_FROM_OAUTH',
  'spiraedmunds@gmail.com',
  'Edmund Spira',
  'admin',
  true, true, false, false, true
);
```

**Auth Flow**:
1. User signs in with Google OAuth
2. System checks `CBAF_ADMIN_EMAILS` env variable
3. If email matches, creates `admin_users` record on first login
4. On subsequent logins, updates `lastLoginAt`

**Debugging Steps**:
1. Check `.env` file has: `CBAF_ADMIN_EMAILS=spiraedmunds@gmail.com`
2. Attempt Google sign-in
3. Check server logs for OAuth errors
4. Verify admin_users table has record
5. Check user role in session

---

### 2. **Missing Economy Detail Pages**
**Status**: NOT IMPLEMENTED
**Impact**: Admins cannot view economy details, merchants cannot be managed properly

**Current State**:
- `/cbaf/admin/economies` - Lists all economies ✅
- `/cbaf/admin/economies/[id]` - MISSING ❌
- `/cbaf/admin/economies/[id]/edit` - MISSING ❌

**Required For**:
- Admins to view merchant lists per economy
- Admins to see detailed video history
- Admins to verify economy information
- Economies (BCE users) to edit their own profile
- Economy logo uploads
- Contact information management

---

## Implementation Plan

### Phase 1: Database Schema Updates

**1.1 Add Logo Field to Economies Table**

```typescript
// lib/db/schema.ts - Add to economies table
export const economies = pgTable('economies', {
  // ... existing fields

  // Logo/Profile Image
  logoUrl: text('logo_url'), // URL to uploaded logo
  logoStorageKey: text('logo_storage_key'), // Storage key for deletion

  // Contact Details (expanded)
  contactEmail: text('contact_email'), // Public contact
  contactPhone: text('contact_phone'),
  organizationType: text('organization_type'), // NGO, Business, Community, etc.

  // Enhanced profile
  foundedYear: integer('founded_year'),
  teamSize: text('team_size'), // '1-5', '6-10', '11-50', '50+'

  // ... existing fields
});
```

**Migration**:
```sql
-- Add new columns
ALTER TABLE economies ADD COLUMN logo_url TEXT;
ALTER TABLE economies ADD COLUMN logo_storage_key TEXT;
ALTER TABLE economies ADD COLUMN contact_email TEXT;
ALTER TABLE economies ADD COLUMN contact_phone TEXT;
ALTER TABLE economies ADD COLUMN organization_type TEXT;
ALTER TABLE economies ADD COLUMN founded_year INTEGER;
ALTER TABLE economies ADD COLUMN team_size TEXT;
```

---

### Phase 2: Economy Detail Page (Admin View)

**2.1 Create Admin Economy Detail Page**

**File**: `app/cbaf/admin/economies/[id]/page.tsx`

**Features**:
- Economy profile information
- Statistics dashboard (videos, merchants, rankings)
- Merchant list with verification status
- Video submission history
- Activity timeline
- Edit button (for admins)
- Verification controls (for admins)

**Layout**:
```
┌─────────────────────────────────────────────┐
│ FloatingNav (Admin)                         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Header: Economy Name + Logo                 │
│ Country, City | Verified Badge              │
│ [Edit] [Verify] [Contact]                   │
└─────────────────────────────────────────────┘
┌───────────┬───────────┬───────────┬─────────┐
│ Videos    │ Merchants │ Rankings  │ Points  │
│ 45        │ 23        │ #3        │ 1,245   │
└───────────┴───────────┴───────────┴─────────┘
┌─────────────────────────────────────────────┐
│ About Economy                               │
│ Description, website, social links          │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Merchants (23)                              │
│ ┌──────────────────────────────────────┐   │
│ │ Merchant Name | BTCMap ✓ | Actions  │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Recent Videos (20)                          │
│ ┌──────────────────────────────────────┐   │
│ │ Video Title | Status | Date         │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Data to Fetch**:
```typescript
// Economy profile
const economy = await db.query.economies.findFirst({
  where: eq(economies.id, params.id)
});

// Merchants for this economy
const merchantList = await db.query.merchants.findMany({
  where: eq(merchants.economyId, params.id),
  orderBy: [desc(merchants.registeredAt)]
});

// Video submissions
const videos = await db.query.videoSubmissions.findMany({
  where: eq(videoSubmissions.economyId, params.id),
  orderBy: [desc(videoSubmissions.submittedAt)],
  limit: 20
});

// Rankings history
const rankings = await db.query.monthlyRankings.findMany({
  where: eq(monthlyRankings.economyId, params.id),
  orderBy: [desc(monthlyRankings.month)],
  limit: 6
});
```

---

### Phase 3: Economy Profile Edit Page

**3.1 Create Economy Edit Page (Admin + BCE Access)**

**File**: `app/cbaf/admin/economies/[id]/edit/page.tsx`

**Access Control**:
- Admins: Can edit any economy
- BCE Users: Can only edit their own economy
- Super Admins: Can edit + verify

**Form Sections**:

**A. Basic Information**
- Economy Name (text)
- Slug (auto-generated, readonly)
- Country (select)
- City (text)
- Description (textarea, 500 chars)

**B. Logo Upload**
- Image upload component
- Max 2MB, PNG/JPG only
- Shows current logo with preview
- Crop/resize tool
- Delete logo option

**C. Contact Information**
- Website URL
- Twitter handle
- Contact Email
- Contact Phone
- Organization Type (select)

**D. Payment Details**
- Lightning Address (validated)
- BTC Address (optional, validated)

**E. Profile Details**
- Founded Year
- Team Size (select)
- Additional notes (textarea)

**Form Component**: `app/cbaf/admin/economies/[id]/edit/EconomyEditForm.tsx`

```typescript
'use client';

interface EconomyEditFormProps {
  economy: Economy;
  canVerify: boolean; // Only admins/super-admins
}

export default function EconomyEditForm({ economy, canVerify }: EconomyEditFormProps) {
  const [formData, setFormData] = useState({...economy});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  // Handle logo upload
  // Validation
  // Save to database
}
```

---

### Phase 4: Logo Upload System

**4.1 File Upload API**

**File**: `app/api/cbaf/economies/[id]/logo/route.ts`

```typescript
// POST /api/cbaf/economies/[id]/logo
// Upload economy logo

import { requireAuth } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    // Check authorization
    const economy = await db.query.economies.findFirst({
      where: eq(economies.id, params.id)
    });

    if (!economy) {
      return NextResponse.json({ error: 'Economy not found' }, { status: 404 });
    }

    // BCE users can only edit their own economy
    if (session.user.role === 'bce' && economy.googleEmail !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
    }

    // TODO: Upload to storage (Vercel Blob, S3, Cloudinary, etc.)
    // For now, we'll use a placeholder
    const logoUrl = '/placeholder-logo.png';
    const storageKey = 'temp-key';

    // Update database
    await db.update(economies)
      .set({
        logoUrl,
        logoStorageKey: storageKey
      })
      .where(eq(economies.id, params.id));

    return NextResponse.json({
      success: true,
      logoUrl
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

// DELETE /api/cbaf/economies/[id]/logo
// Delete economy logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Similar auth checks
  // Delete from storage
  // Update database to null
}
```

**Storage Options**:
1. **Vercel Blob** (Recommended) - Built-in, simple
2. **Cloudinary** - Free tier, image transformations
3. **AWS S3** - More control, cheaper at scale
4. **Local /public** - Development only

---

### Phase 5: Economy Update API

**5.1 Update Economy Profile**

**File**: `app/api/cbaf/economies/[id]/route.ts`

```typescript
// PUT /api/cbaf/economies/[id]
// Update economy profile

import { requireAuth } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { economies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    // Get economy
    const economy = await db.query.economies.findFirst({
      where: eq(economies.id, params.id)
    });

    if (!economy) {
      return NextResponse.json({ error: 'Economy not found' }, { status: 404 });
    }

    // Authorization check
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    const isOwnEconomy = economy.googleEmail === session.user.email;

    if (!isAdmin && !isOwnEconomy) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Fields that BCE users can edit
    const allowedFields = {
      economyName: body.economyName,
      description: body.description,
      city: body.city,
      website: body.website,
      twitter: body.twitter,
      lightningAddress: body.lightningAddress,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      organizationType: body.organizationType,
      foundedYear: body.foundedYear,
      teamSize: body.teamSize,
    };

    // Fields only admins can edit
    if (isAdmin) {
      Object.assign(allowedFields, {
        country: body.country,
        isVerified: body.isVerified,
      });
    }

    // Update database
    await db.update(economies)
      .set({
        ...allowedFields,
        lastActivityAt: new Date()
      })
      .where(eq(economies.id, params.id));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Economy update error:', error);
    return NextResponse.json(
      { error: 'Failed to update economy' },
      { status: 500 }
    );
  }
}

// GET /api/cbaf/economies/[id]
// Get economy details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fetch economy with related data
  // Return JSON
}
```

---

### Phase 6: BCE User Dashboard

**6.1 Update BCE Dashboard to Show Profile Completion**

**File**: `app/cbaf/dashboard/page.tsx`

Add profile completion widget:
```tsx
{/* Profile Completion */}
{!economy.logoUrl && (
  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
    <h3 className="font-bold text-yellow-800 mb-2">
      Complete Your Profile
    </h3>
    <p className="text-sm text-yellow-700 mb-3">
      Add a logo and complete your profile to improve visibility
    </p>
    <Link
      href={`/cbaf/admin/economies/${economy.id}/edit`}
      className="btn-primary text-sm"
    >
      Edit Profile
    </Link>
  </div>
)}
```

---

## File Structure

```
app/cbaf/
├── admin/
│   └── economies/
│       ├── page.tsx                    # List view (existing) ✅
│       ├── GroupedEconomies.tsx        # List component (existing) ✅
│       └── [id]/
│           ├── page.tsx                # Detail view (NEW) 🆕
│           ├── EconomyStats.tsx        # Stats component (NEW) 🆕
│           ├── MerchantList.tsx        # Merchants table (NEW) 🆕
│           ├── VideoHistory.tsx        # Videos table (NEW) 🆕
│           └── edit/
│               ├── page.tsx            # Edit form page (NEW) 🆕
│               ├── EconomyEditForm.tsx # Form component (NEW) 🆕
│               └── LogoUpload.tsx      # Logo upload (NEW) 🆕
│
└── api/cbaf/economies/
    └── [id]/
        ├── route.ts                    # GET/PUT economy (NEW) 🆕
        └── logo/
            └── route.ts                # POST/DELETE logo (NEW) 🆕
```

---

## Implementation Order

### Week 1: Foundation
- [x] Database schema updates (add logo fields)
- [ ] Run migration
- [ ] Fix admin login issue (spiraedmunds@gmail.com)
- [ ] Create API routes for economy GET/PUT

### Week 2: Admin Detail View
- [ ] Create economy detail page (`/cbaf/admin/economies/[id]`)
- [ ] Build EconomyStats component
- [ ] Build MerchantList component
- [ ] Build VideoHistory component
- [ ] Add navigation links from list view

### Week 3: Edit Functionality
- [ ] Create edit page (`/cbaf/admin/economies/[id]/edit`)
- [ ] Build EconomyEditForm component
- [ ] Implement form validation
- [ ] Connect form to API
- [ ] Test admin edit permissions

### Week 4: Logo Upload
- [ ] Setup storage provider (Vercel Blob recommended)
- [ ] Create logo upload API routes
- [ ] Build LogoUpload component
- [ ] Add image preview and crop
- [ ] Test upload/delete flow

### Week 5: BCE Access
- [ ] Add edit link to BCE dashboard
- [ ] Test BCE edit permissions (can only edit own)
- [ ] Add profile completion widget
- [ ] Test end-to-end BCE flow

### Week 6: Polish & Testing
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Test all permission levels
- [ ] Documentation
- [ ] Deploy

---

## Permission Matrix

| Action | BCE User | Admin | Super Admin |
|--------|----------|-------|-------------|
| View own economy detail | ✅ | ✅ | ✅ |
| View other economy detail | ❌ | ✅ | ✅ |
| Edit own economy | ✅ | ✅ | ✅ |
| Edit other economy | ❌ | ✅ | ✅ |
| Upload own logo | ✅ | ✅ | ✅ |
| Upload other's logo | ❌ | ✅ | ✅ |
| Verify economy | ❌ | ✅ | ✅ |
| Change country | ❌ | ✅ | ✅ |
| Delete economy | ❌ | ❌ | ✅ |

---

## Testing Scenarios

### Admin Tests
1. Sign in as admin (spiraedmunds@gmail.com)
2. View economy list
3. Click on an economy
4. View full economy details
5. See all merchants for that economy
6. See all videos for that economy
7. Click "Edit"
8. Update economy information
9. Upload logo
10. Save changes

### BCE Tests
1. Sign in as BCE user
2. View dashboard
3. See "Complete Profile" widget
4. Click edit profile
5. Upload logo
6. Update description
7. Add contact info
8. Save changes
9. Try to edit another economy (should fail)
10. View updated profile

### Super Admin Tests
1. All admin tests +
2. Verify economy
3. Change economy country
4. Access all economy edit pages

---

## Next Steps

1. **Immediate**: Fix admin login issue
   - Verify `.env` configuration
   - Check OAuth setup
   - Test sign-in flow
   - Check database admin_users table

2. **Priority 1**: Create economy detail page
   - Start with read-only view
   - Show all related data
   - Add to navigation

3. **Priority 2**: Add edit functionality
   - Create edit form
   - Connect to API
   - Test permissions

4. **Priority 3**: Logo upload system
   - Setup storage
   - Build upload component
   - Test upload/delete

---

## Database Migration Script

```sql
-- Add new columns to economies table
ALTER TABLE economies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE economies ADD COLUMN IF NOT EXISTS logo_storage_key TEXT;
ALTER TABLE economies ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE economies ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE economies ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE economies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE economies ADD COLUMN IF NOT EXISTS team_size TEXT;

-- Verify admin user exists
SELECT * FROM admin_users WHERE google_email = 'spiraedmunds@gmail.com';

-- If needed, create admin user (replace GOOGLE_ID with actual)
-- INSERT INTO admin_users (...) VALUES (...);
```

---

## Conclusion

This plan provides a complete roadmap for implementing economy detail and edit pages with proper access control, logo uploads, and comprehensive profile management. The implementation is phased to allow iterative development and testing.

**Estimated Timeline**: 4-6 weeks
**Priority**: HIGH (critical for admin operations)
**Complexity**: MEDIUM (requires storage setup and permission logic)
