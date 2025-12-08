# CBAF (Circular Bitcoin African Fund) Management System

## Overview

The CBAF module is a comprehensive platform for managing Bitcoin circular economy funding. It replaces the manual Telegram + spreadsheet workflow with an automated system featuring duplicate detection, role-based access, and integrated Lightning payments.

## Phase 2 Status: ✅ COMPLETED

**Google OAuth Authentication** - Fully implemented and deployed

### What's Working Now

1. **Google OAuth Sign-In** (`/auth/signin`)
   - Secure authentication via Google accounts
   - Automatic role detection based on email
   - First-time user onboarding flow

2. **Role-Based Access Control**
   - **Super Admin**: `edmundspira@gmail.com` - Full system access
   - **Admin**: `spiraedmunds@gmail.com` - Video review and approval
   - **BCE Users**: All other users - Submit videos and manage merchants

3. **BCE Profile Setup** (`/cbaf/setup`)
   - Economy name and slug creation
   - Country and city information
   - Contact info (website, Twitter, Telegram)
   - Lightning address for receiving funding

4. **Session Management**
   - Persistent authentication across pages
   - JWT-based sessions (30-day expiry)
   - Protected routes with automatic redirects

5. **Security Features**
   - Environment-based role configuration
   - NEXTAUTH_SECRET for session encryption
   - OAuth 2.0 best practices

## Environment Setup

### Required Environment Variables

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://tools.afribit.africa
NEXTAUTH_SECRET=<generated-secret>

# Google OAuth Credentials
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Admin Email Lists
CBAF_SUPER_ADMIN_EMAILS=edmundspira@gmail.com
CBAF_ADMIN_EMAILS=spiraedmunds@gmail.com
```

### Google Cloud Console Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://tools.afribit.africa/api/auth/callback/google` (production)

## User Flows

### First-Time BCE User
1. Visit `/auth/signin`
2. Click "Sign in with Google"
3. Grant permissions
4. Redirected to `/cbaf/setup`
5. Complete economy profile (name, country, Lightning address)
6. Submit → Redirected to `/cbaf/dashboard` (Phase 3)

### Returning BCE User
1. Sign in with Google
2. Auto-redirected to `/cbaf/dashboard`
3. Access video submission, merchant management

### Admin User
1. Sign in with Google
2. Auto-redirected to `/cbaf/admin/reviews` (Phase 4)
3. Review submitted videos
4. Approve/reject with comments

### Super Admin User
1. Sign in with Google
2. Full access to all admin features
3. Additional: `/cbaf/super-admin/funding` for bulk payments (Phase 7)

## Database Schema (Phase 1 - Completed)

### Tables Created
- `economies` - BCE profiles with OAuth data
- `merchants` - BTCMap-verified merchant registry
- `video_submissions` - Proof-of-work videos with duplicate detection
- `video_merchants` - Many-to-many junction table
- `admin_users` - Admin/Super Admin profiles
- `funding_disbursements` - Payment tracking
- `monthly_rankings` - Pre-calculated leaderboards

### Key Features
- SHA-256 hash-based duplicate detection
- Platform-specific URL normalization (YouTube, Twitter, TikTok, Instagram)
- Foreign key constraints with cascade deletes
- Optimized indexes for frequent queries

## API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth handler
- `GET /auth/signin` - Sign-in page
- `GET /auth/error` - Error handling page
- `GET /unauthorized` - Access denied page

### BCE Setup
- `POST /api/cbaf/economy/setup` - Complete profile setup
  - Body: `{ economyName, slug, country, city, description, website, twitter, telegram, lightningAddress }`
  - Returns: `{ success, economy }`

### Video Submission (Phase 1 - Built, Phase 3 UI needed)
- `POST /api/cbaf/videos/submit` - Submit video for review
  - Body: `{ economyId, videoUrl, videoTitle, videoDescription, merchantBtcmapUrls }`
  - Returns: `{ success, submission }` or `{ error: 'duplicate', original }`
- `GET /api/cbaf/videos/check-duplicate?url=<url>` - Pre-check for duplicates

## Helper Functions

### Authentication Helpers (`lib/auth/session.ts`)

```typescript
import { requireAuth, requireBCE, requireAdmin, requireSuperAdmin, requireBCEProfile } from '@/lib/auth/session';

// Require any authenticated user
const session = await requireAuth();

// Require BCE role (redirects admins to /unauthorized)
const bceSession = await requireBCE();

// Require BCE with completed profile (redirects to /cbaf/setup if incomplete)
const profileSession = await requireBCEProfile();

// Require admin or super admin
const adminSession = await requireAdmin();

// Require super admin only
const superAdminSession = await requireSuperAdmin();
```

### Usage in Pages

```typescript
// app/cbaf/dashboard/page.tsx
import { requireBCEProfile } from '@/lib/auth/session';

export default async function DashboardPage() {
  const session = await requireBCEProfile();
  
  return (
    <div>
      <h1>Welcome {session.user.economyName}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Usage in API Routes

```typescript
// app/api/cbaf/videos/submit/route.ts
import { requireBCE } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const session = await requireBCE();
  
  // session.user.economyId is guaranteed to exist
  const economyId = session.user.economyId!;
  
  // Process video submission...
}
```

## Client-Side Usage

```typescript
'use client';
import { useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Please sign in</div>;
  
  return (
    <div>
      <p>Welcome {session.user.name}</p>
      <p>Role: {session.user.role}</p>
      {session.user.role === 'bce' && (
        <p>Economy: {session.user.economyName}</p>
      )}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Duplicate Detection System

### How It Works
1. User submits video URL
2. System normalizes URL (removes tracking params, extracts video ID)
3. Generates SHA-256 hash
4. Checks `video_submissions` table for matching hash
5. If found:
   - Returns original submission details
   - Shows time elapsed since original submission
   - Prevents duplicate
6. If unique:
   - Creates new submission
   - Stores hash for future checks

### Supported Platforms
- **YouTube**: Handles `/watch?v=`, `/embed/`, `/shorts/` URLs
- **Twitter/X**: Extracts tweet IDs
- **TikTok**: Handles `vm.tiktok.com` redirects and video paths
- **Instagram**: Supports `/p/`, `/reel/`, `/tv/` posts

### Example

```typescript
// Same video, different URLs - all detected as duplicates:
// 1. https://www.youtube.com/watch?v=ABC123&feature=share
// 2. https://youtu.be/ABC123
// 3. https://www.youtube.com/embed/ABC123
// 4. https://m.youtube.com/watch?v=ABC123
// All hash to same value: sha256("youtube:ABC123")
```

## Next Steps (Phases 3-8)

### Phase 3: BCE Dashboard (Next Priority)
- [ ] Economy profile page with statistics
- [ ] Video submission form with merchant selector
- [ ] Merchant registration with BTCMap URL input
- [ ] Monthly submission history
- [ ] Real-time ranking display

### Phase 4: Admin Review Interface
- [ ] Video review queue with filters
- [ ] Embedded video players (YouTube, Twitter, etc.)
- [ ] Approve/reject buttons with comment system
- [ ] Merchant verification status display
- [ ] Economy overview page

### Phase 5: BTCMap Integration
- [ ] `lib/btcmap/verify-merchant.ts` - Query BTCMap API
- [ ] Auto-extract merchant details (name, category, location)
- [ ] Background verification job
- [ ] Update `merchants` table with verification status

### Phase 6: Analytics & Rankings
- [ ] Monthly ranking calculator based on approved videos
- [ ] Leaderboard component (by videos, merchants, new merchants)
- [ ] Statistics dashboard with Recharts
- [ ] Export reports (CSV, PDF)

### Phase 7: Fastlight Integration
- [ ] Funding calculator page
- [ ] CSV export for bulk payments
- [ ] Import to existing Fastlight module
- [ ] Track payment status in `funding_disbursements`

### Phase 8: Testing & Launch
- [ ] End-to-end testing with test data
- [ ] Seed database with example economies
- [ ] User documentation and guides
- [ ] Production deployment

## Testing Locally

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Visit sign-in page**:
   ```
   http://localhost:3000/auth/signin
   ```

3. **Test as Super Admin**:
   - Sign in with `edmundspira@gmail.com`
   - Should have full access

4. **Test as Admin**:
   - Sign in with `spiraedmunds@gmail.com`
   - Should have review access

5. **Test as BCE**:
   - Sign in with any other Gmail account
   - Should be prompted to complete profile setup

## Troubleshooting

### "Configuration" Error
- Check that all environment variables are set in `.env`
- Ensure `NEXTAUTH_SECRET` is a valid base64 string
- Verify Google OAuth credentials are correct

### "AccessDenied" Error
- For admin routes: Check email is in `CBAF_SUPER_ADMIN_EMAILS` or `CBAF_ADMIN_EMAILS`
- For BCE routes: Any Gmail account should work

### Redirect Loop
- Clear browser cookies
- Check `NEXTAUTH_URL` matches your actual URL
- Ensure OAuth redirect URIs are correctly configured in Google Cloud Console

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Run migration: `npm run db:migrate`
- Check Neon dashboard for connection status

## Security Considerations

1. **Never commit `.env` file** - Contains secrets
2. **Rotate NEXTAUTH_SECRET** periodically
3. **Use HTTPS in production** - Required for OAuth
4. **Whitelist redirect URIs** in Google Cloud Console
5. **Validate user input** in all API routes
6. **Use parameterized queries** (Drizzle ORM handles this)
7. **Check user roles** before sensitive operations

## Support

For issues or questions:
1. Check this README
2. Review code comments in `lib/auth/` and `app/api/cbaf/`
3. Contact project maintainers

---

**Last Updated**: December 8, 2025
**Status**: Phase 2 Complete ✅ | Phase 3 Ready to Start 🚀
