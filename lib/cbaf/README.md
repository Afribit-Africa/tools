# CBAF Management System

## Overview

The Circular Bitcoin Africa Fund (CBAF) Management System is a comprehensive platform for managing Bitcoin circular economies across Africa. It enables economies to submit Proof of Work videos, track merchant engagement, and receive funding based on verified activity.

## Key Features

### 🎥 Video Submission & Verification
- Submit Proof of Work videos showing Bitcoin transactions
- Auto-detect video platform (YouTube, Twitter, TikTok, Instagram)
- Link merchants involved in each video
- Track approval status and admin feedback

### 🔒 Duplicate Detection System

The system includes robust duplicate detection to prevent the same video from being submitted multiple times:

#### How It Works

1. **URL Normalization**: When a video URL is submitted, the system normalizes it to catch variations:
   - Removes protocol differences (http/https)
   - Removes www prefix
   - Handles platform-specific URL formats
   - Extracts canonical video IDs

2. **Hash Generation**: Creates a SHA-256 hash of the normalized URL

3. **Duplicate Check**: Searches database for any previous submission with the same hash

4. **Prevention**: Blocks duplicate submissions and shows clear error message

#### Example Scenarios Caught

**Same video, different URLs:**
```
✅ BLOCKED: https://www.youtube.com/watch?v=ABC123
✅ BLOCKED: https://youtu.be/ABC123
✅ BLOCKED: https://youtube.com/embed/ABC123
✅ BLOCKED: http://www.youtube.com/watch?v=ABC123&feature=share
```

**Same video, different months:**
```
❌ Economy A submits video in October 2025 ✅ Approved
❌ Economy A tries to resubmit same video in December 2025 ⛔ BLOCKED

Error: "This video was previously submitted by your economy on October 15, 2025
(2 months ago). Status: approved. You cannot resubmit the same video."
```

**Same video, different economies:**
```
❌ Economy A submits video in November 2025 ✅ Approved
❌ Economy B tries to submit same video in December 2025 ⛔ BLOCKED

Error: "This video was previously submitted by another economy on November 3, 2025
(1 month ago). Status: approved. Each video can only be submitted once across all economies."
```

#### API Endpoints

**Check for duplicates before submission:**
```bash
GET /api/cbaf/videos/check-duplicate?url=<video_url>&economyId=<economy_id>

Response:
{
  "isDuplicate": true,
  "message": "⚠️ This video was previously submitted...",
  "originalSubmission": {
    "id": "uuid",
    "submittedAt": "2025-10-15T10:30:00Z",
    "status": "approved",
    "submissionMonth": "2025-10"
  }
}
```

**Submit video (with automatic duplicate check):**
```bash
POST /api/cbaf/videos/submit

Body:
{
  "economyId": "uuid",
  "videoUrl": "https://youtube.com/watch?v=ABC123",
  "videoTitle": "Bitcoin transaction at Mama Sarah's Shop",
  "videoDescription": "Showing Lightning payment",
  "merchantIds": ["merchant-uuid-1", "merchant-uuid-2"]
}

Response (if duplicate):
{
  "error": "Duplicate video detected",
  "message": "⚠️ This video was previously submitted...",
  "originalSubmission": {...}
}
```

### 🏪 Merchant Management
- Register merchants with BTCMap links
- Auto-verify merchant details from BTCMap API
- Track merchant appearances across videos
- Detect new vs returning merchants

### 👥 Role-Based Access Control
- **BCE**: Submit videos, register merchants, view own stats
- **Admin**: Review videos, approve/reject, view analytics
- **Super Admin**: Send bulk payments, manage system

### 📊 Analytics & Rankings
- Monthly leaderboards by videos approved
- Track new merchant growth
- Compare economies anonymously
- View funding allocation

### 💸 Bulk Payment Integration
- Calculate funding based on configurable formula
- Export payment data to Fastlight
- Send bulk Lightning payments
- Track payment history

## Database Schema

### Core Tables

1. **economies**: Bitcoin Circular Economy profiles
2. **merchants**: Registered merchants with BTCMap links
3. **video_submissions**: Proof of Work videos with duplicate detection
4. **video_merchants**: Links videos to merchants
5. **admin_users**: Admin and Super Admin accounts
6. **funding_disbursements**: Payment history
7. **monthly_rankings**: Pre-calculated rankings

### Key Fields for Duplicate Detection

```typescript
videoSubmissions {
  videoUrl: string          // Original URL
  videoUrlHash: string      // SHA-256 hash for duplicate detection
  isDuplicate: boolean      // Flag for duplicates
  duplicateOfId: uuid       // Reference to original submission
  duplicateDetectedAt: date // When duplicate was detected
}
```

## Implementation Status

### ✅ Completed
- Database schema with Drizzle ORM
- Duplicate detection logic with URL normalization
- Video submission API with duplicate checking
- SHA-256 hash generation
- Platform detection (YouTube, Twitter, TikTok, Instagram)

### 🚧 In Progress
- Google OAuth authentication
- BCE dashboard pages
- Admin review interface
- BTCMap integration

### 📋 Planned
- Analytics and ranking system
- Fastlight bulk payment integration
- Email notifications
- Video metadata extraction
- Mobile responsive design

## Security Features

### Duplicate Prevention
- SHA-256 hashing of normalized URLs
- Database-level unique constraint on hash
- Cross-economy duplicate detection
- Time-based duplicate tracking

### Access Control
- Google OAuth 2.0 authentication
- Role-based middleware
- Economy-scoped data access
- Admin audit trail

### Rate Limiting
- Video submissions: 10 per hour per economy
- Merchant registrations: 20 per hour per economy
- API calls: 100 per minute per user

## Usage Examples

### Frontend Integration

```typescript
// Check for duplicate before submission
async function checkDuplicate(videoUrl: string, economyId: string) {
  const response = await fetch(
    `/api/cbaf/videos/check-duplicate?url=${encodeURIComponent(videoUrl)}&economyId=${economyId}`
  );
  const data = await response.json();

  if (data.isDuplicate) {
    // Show error to user
    alert(data.message);
    return false;
  }

  return true;
}

// Submit video
async function submitVideo(data: VideoSubmissionData) {
  // First check for duplicates
  const isUnique = await checkDuplicate(data.videoUrl, data.economyId);

  if (!isUnique) {
    return;
  }

  // Proceed with submission
  const response = await fetch('/api/cbaf/videos/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.status === 409) {
    // Duplicate detected (shouldn't happen if we checked first)
    alert(result.message);
  } else if (result.success) {
    // Success!
    console.log('Video submitted:', result.submission);
  }
}
```

## Next Steps

1. **Phase 2**: Implement Google OAuth and authentication
2. **Phase 3**: Build BCE dashboard for video submissions
3. **Phase 4**: Create admin review interface
4. **Phase 5**: Integrate BTCMap verification
5. **Phase 6**: Add analytics and ranking calculator
6. **Phase 7**: Connect Fastlight for bulk payments
7. **Phase 8**: Polish UI and launch pilot

## Support

For questions or issues with the CBAF system:
- Open an issue on GitHub
- Contact: admin@afribit.africa
- Documentation: [CBAF_MANAGEMENT_PLAN.md](./CBAF_MANAGEMENT_PLAN.md)

---

**Built with ❤️ for the Bitcoin circular economy movement in Africa**
