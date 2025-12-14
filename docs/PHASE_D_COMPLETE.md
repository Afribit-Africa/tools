# Phase D: Merchant-Level Funding Distribution - COMPLETE ✅

## Overview
Phase D replaces economy-level funding distribution with merchant-level payments using verified Lightning addresses. Super admins can now calculate and export individual merchant payments for direct distribution.

---

## Implementation Summary

### ✅ Core Components Created

**1. Merchant Funding Calculator** (`lib/cbaf/merchant-funding-calculator.ts`)
- **Purpose**: Core algorithm for distributing economy allocations to individual merchants
- **Algorithm**:
  - Gets all merchants that appeared in approved videos for the period
  - Categorizes by address status (verified, unverified, no address)
  - Distributes economy allocation equally among verified merchants
  - Tracks unallocated funds (merchants without verified addresses)
  - Counts video appearances per merchant

**2. API Endpoint** (`app/api/cbaf/funding/calculate-merchant-level/route.ts`)
- **Endpoint**: `POST /api/cbaf/funding/calculate-merchant-level`
- **Process**:
  1. Authenticate super admin
  2. Parse period (month/year)
  3. Calculate economy-level allocations from rankings
  4. Distribute to merchants with verified addresses
  5. Return detailed breakdown

**3. UI Component** (`app/cbaf/super-admin/funding/allocate/MerchantFundingPanel.tsx`)
- **Features**:
  - Configuration form (total funding pool input)
  - Summary dashboard (distributed, unallocated, unverified, no address)
  - CSV export for bulk payments
  - Expandable economy breakdowns
  - Per-merchant payment details
  - Unallocated fund warnings

**4. Tabs Integration** (`app/cbaf/super-admin/funding/allocate/FundingTabs.tsx`)
- **Purpose**: Toggle between economy-level and merchant-level views
- **Tabs**:
  - Economy-Level Allocation (original system)
  - Merchant-Level Payments (new Phase D system)

---

## Data Flow

```
Super Admin Action
    ↓
Enter Total Funding Pool (e.g., 10M sats)
    ↓
Calculate Merchant Payments Button
    ↓
API: calculate-merchant-level
    ↓
1. Get economy rankings/allocations
2. For each economy:
   - Find merchants in approved videos
   - Filter verified addresses
   - Distribute: totalAllocation / verifiedMerchants
   - Track unallocated (unverified/missing)
    ↓
Return detailed breakdown
    ↓
UI displays:
- Summary stats (4 cards)
- Economy breakdowns (expandable)
- Merchant payment lists
- CSV export button
```

---

## Key Features

### 1. Equal Distribution
- Each verified merchant in an economy receives equal share
- `amountPerMerchant = economyAllocation / verifiedMerchantsCount`

### 2. Unallocated Tracking
- Merchants without Lightning addresses → unallocated
- Merchants with unverified addresses → unallocated
- System calculates percentage of total pool unallocated
- Yellow warning if >10% unallocated

### 3. Video Appearance Count
- Tracks how many approved videos each merchant appeared in
- Displayed in merchant payment details
- Useful for future weighting algorithms

### 4. CSV Export
**Format**:
```csv
Lightning Address, Amount (sats), Merchant Name, Local Name, Provider, Economy, Video Appearances, Note
merchant@blink.sv, 400000, Mama Wanjiku's Shop, Mama Wanjiku, blink, Kibera, 3, Verified
```

**Use Case**: Import into bulk payment tools (Blink dashboard, etc.)

### 5. Multi-Economy Support
- Calculates for all economies in single operation
- Expandable cards per economy
- Shows rank, allocation, merchant counts
- Drill down to individual merchant details

---

## Payment Categories

### ✅ Verified Merchants (Receive Payment)
- Have Lightning address
- `addressVerified = true`
- Appear in merchant payment list
- Included in CSV export

### ⚠️ Unverified Merchants (Funds Held)
- Have Lightning address
- `addressVerified = false` or `null`
- Count displayed in summary
- Funds remain unallocated

### ❌ Merchants Without Addresses (Funds Held)
- No Lightning address provided
- Count displayed in summary
- Funds remain unallocated

---

## UI Structure

### Summary Dashboard (4 Cards)

1. **Distributed** (Green)
   - Total sats distributed
   - Merchant count

2. **Unallocated** (Yellow)
   - Sats not distributed
   - Percentage of total

3. **Unverified** (Red)
   - Count of merchants with unverified addresses

4. **No Address** (Gray)
   - Count of merchants without addresses

### Economy Breakdown Cards

**Header**:
- Rank badge (#1, #2, etc.)
- Economy name
- Merchant counts (verified/unverified/no address)

**Summary**:
- Total allocation
- Amount per merchant (if verified merchants exist)

**Expanded View**:
- List of all merchant payments
- Details: Name, Local Name, Address, Provider, Amount, Videos
- Unallocated warning (if applicable)

---

## Technical Details

### Database Queries

**Merchant Selection**:
```sql
SELECT merchants.*
FROM merchants
LEFT JOIN video_merchants ON merchants.id = video_merchants.merchant_id
LEFT JOIN video_submissions ON video_merchants.video_id = video_submissions.id
WHERE merchants.economy_id = ?
  AND video_submissions.status = 'approved'
  AND video_submissions.submission_month = ?
  AND video_submissions.id IS NOT NULL
GROUP BY merchants.id
```

**Video Appearances**:
```sql
SELECT COUNT(*)
FROM video_merchants
LEFT JOIN video_submissions ON video_merchants.video_id = video_submissions.id
WHERE video_merchants.merchant_id = ?
  AND video_submissions.status = 'approved'
  AND video_submissions.submission_month = ?
```

### Response Structure

```typescript
{
  success: true,
  period: { month: "2025-12", year: 2025, monthName: "December" },
  economyLevelAllocation: {
    totalPool: 10000000,
    economies: 5
  },
  merchantLevelDistribution: {
    totalPool: 10000000,
    totalDistributed: 8500000,
    totalUnallocated: 1500000,
    unallocatedPercentage: "15.0",
    economyBreakdowns: [
      {
        economyId: "...",
        economyName: "Kibera",
        overallRank: 1,
        totalAllocation: 2000000,
        verifiedMerchants: 5,
        unverifiedMerchants: 2,
        merchantsWithoutAddresses: 1,
        merchantPayments: [
          {
            merchantId: "...",
            merchantName: "Mama Wanjiku's Shop",
            lightningAddress: "wanjiku@blink.sv",
            amountSats: 400000,
            videoAppearances: 3,
            ...
          }
        ],
        unallocatedAmount: 0
      }
    ],
    paymentRecords: [ /* All payments */ ],
    summary: {
      totalMerchants: 50,
      merchantsWithVerifiedAddresses: 35,
      merchantsWithUnverifiedAddresses: 10,
      merchantsWithoutAddresses: 5
    }
  }
}
```

---

## Testing Guide

### Manual Test Steps

1. **Navigate to Funding Page**
   - URL: `http://localhost:3001/cbaf/super-admin/funding/allocate`
   - Login as super admin

2. **Switch to Merchant-Level Tab**
   - Click "Merchant-Level Payments" tab

3. **Calculate Payments**
   - Enter total pool (default: 10,000,000 sats)
   - See USD equivalent (~$3,500 at $35k/BTC)
   - Click "Calculate Merchant Payments"

4. **Verify Summary**
   - Check distributed amount
   - Check unallocated percentage
   - Verify merchant counts

5. **Expand Economy Breakdown**
   - Click on an economy card
   - See merchant list with:
     - Merchant name
     - Lightning address
     - Amount (sats)
     - Video appearances
     - Payment provider

6. **Export CSV**
   - Click "Export X Merchant Payments to CSV"
   - Verify file downloads: `cbaf-merchant-payments-YYYY-MM.csv`
   - Open in spreadsheet app
   - Verify format matches bulk payment tools

### Edge Cases to Test

- ✅ Economy with all verified merchants (0% unallocated)
- ⚠️ Economy with all unverified merchants (100% unallocated)
- ⚠️ Economy with mixed verified/unverified (partial distribution)
- ❌ Economy with no merchants (empty breakdown)
- 📹 Merchant appearing in multiple videos (counted once per video)

---

## Integration with Existing System

### Phases A-C (Completed)
- **Phase A**: Database schemas (payment fields, verification)
- **Phase B**: Video submission form (Lightning address inputs)
- **Phase C**: Admin verification interface (address validation)

### Phase D (Current)
- **Builds on**: Verified Lightning addresses from Phase C
- **Uses**: Monthly rankings from existing system
- **Adds**: Merchant-level distribution instead of economy-level

### How It Works Together

```
BCE submits video
  ↓ (Phase B)
Includes merchant Lightning addresses
  ↓ (Phase C)
Admin verifies addresses (green checkmark)
  ↓ (Phase D)
Super admin calculates merchant payments
  ↓
Export CSV → Bulk payment import
  ↓
Direct Lightning payments to merchants
```

---

## Files Modified/Created

### New Files
- `lib/cbaf/merchant-funding-calculator.ts` (220 lines)
- `app/api/cbaf/funding/calculate-merchant-level/route.ts` (70 lines)
- `app/cbaf/super-admin/funding/allocate/MerchantFundingPanel.tsx` (310 lines)
- `app/cbaf/super-admin/funding/allocate/FundingTabs.tsx` (60 lines)

### Modified Files
- `app/cbaf/super-admin/funding/allocate/page.tsx` (added tabs integration)

---

## Known Issues/Limitations

### Non-Critical
1. ⚠️ **Prerendering warnings**: `/auth/signin` and `/auth/error` (Next.js Suspense boundaries)
   - **Impact**: None for development/production functionality
   - **Fix**: Wrap useSearchParams in Suspense boundary (low priority)

### Potential Improvements
1. **Video appearance weighting**: Currently equal distribution; could weight by video count
2. **Unallocated fund strategy**: Need to decide rollover vs. redistribution
3. **Performance optimization**: Batch video appearance queries (currently per-merchant)
4. **Email notifications**: Send payment confirmation to merchants (future enhancement)

---

## Success Criteria ✅

- ✅ Merchant funding calculator algorithm complete
- ✅ API endpoint functional with proper auth
- ✅ UI component with all required features
- ✅ Tabs integration for economy/merchant toggle
- ✅ CSV export generates valid format
- ✅ Unallocated funds tracked and displayed
- ✅ Economy breakdowns expandable and accurate
- ✅ Build passes (only prerendering warnings)
- ⏳ **Pending**: End-to-end testing with real data
- ⏳ **Pending**: CSV import verification with bulk payment tools

---

## Next Steps (Phase E)

### 1. End-to-End Testing (2-3 hours)

**Complete Workflow**:
1. Submit video with merchant payment addresses (BCE)
2. Admin verifies addresses (green checkmarks)
3. Super admin calculates merchant payments
4. Export CSV
5. Import to bulk payment tool (Blink, etc.)
6. Verify payments sent

**Edge Cases**:
- Video with all unverified addresses
- Economy with no verified merchants
- Merchant in multiple videos
- Invalid Lightning address format

### 2. Documentation
- Create user guide for super admins
- Document CSV import process for payment tools
- Add troubleshooting section

### 3. Production Deployment
- Environment variable validation
- Database migration verification
- Performance testing with large datasets

---

## Timeline

- **Phase D Start**: Session start
- **Core Logic**: 1 hour (calculator algorithm)
- **API Endpoint**: 30 minutes
- **UI Component**: 1.5 hours (with summary cards, expandable sections, CSV export)
- **Integration**: 30 minutes (tabs, page integration)
- **Bug Fixes**: 30 minutes (groupBy query, field names)
- **Phase D Complete**: ✅ ~4 hours total

---

## Developer Notes

### Key Design Decisions

1. **Equal Distribution**: Simplest fair algorithm; can add weighting later
2. **Unallocated Tracking**: Transparency for missing/unverified addresses
3. **CSV Export**: Standard format for bulk payment tools
4. **Expandable UI**: Balances overview with detailed drill-down
5. **Tab Navigation**: Preserves existing economy-level view while adding merchant-level

### Code Quality
- ✅ TypeScript type safety (full type coverage)
- ✅ Drizzle ORM (safe database queries)
- ✅ React best practices (client/server components)
- ✅ Error handling (try/catch, status codes)
- ✅ Responsive design (mobile-friendly cards)

### Performance Considerations
- **Query Optimization**: groupBy for merchant deduplication
- **Lazy Loading**: Expandable sections reduce initial render
- **CSV Generation**: Client-side (no server load)
- **Background Jobs**: Consider for large datasets (future)

---

## Contact

For questions or issues with Phase D:
- Review `docs/PHASE_D_COMPLETE.md` (this file)
- Check `lib/cbaf/merchant-funding-calculator.ts` for algorithm details
- Test endpoint: `POST /api/cbaf/funding/calculate-merchant-level`
- UI location: `/cbaf/super-admin/funding/allocate` (Merchant-Level tab)

---

**Status**: Phase D Complete ✅
**Build Status**: Passing ✅
**Dev Server**: Running on port 3001 ✅
**Ready for**: Phase E (End-to-End Testing)
