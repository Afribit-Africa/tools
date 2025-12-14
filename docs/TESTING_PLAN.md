# Phase E: Comprehensive Testing Plan

## Overview
This document outlines the complete testing strategy for the CBAF Payment Verification System (Phases A-D).

## Test Environment Setup

### Prerequisites
- ✅ Dev server running on port 3001
- ✅ Database connected and migrated
- ✅ Gmail SMTP configured
- ✅ All phases A-D code complete

### Test Accounts
- **Super Admin**: (Use existing super admin account)
- **Admin**: (Use existing admin account)
- **BCE**: (Use existing BCE account)

---

## Unit Tests

### 1. Payment Validation Service Tests

**File**: `__tests__/payment-validation.test.ts`

**Test Coverage**:
- ✅ Blink address validation
  - Valid formats: `user@blink.sv`
  - Invalid formats: missing username, wrong domain
  - Special characters, case sensitivity

- ✅ Fedi address validation
  - Valid formats: `user@fedi.xyz`
  - Invalid formats

- ✅ Machankura phone validation
  - Valid Kenyan numbers: `+254712345678`
  - Invalid formats, wrong country codes

- ✅ Provider mismatch detection
- ✅ Edge cases: null, empty, whitespace
- ✅ Real API validation (Blink)

**Run Tests**:
```bash
npm test -- payment-validation.test.ts
```

**Expected Results**:
- All format validations pass
- Provider detection accurate
- Edge cases handled gracefully
- API validation completes within 15s

---

### 2. Merchant Funding Calculator Tests

**File**: `__tests__/merchant-funding-calculator.test.ts`

**Test Coverage**:
- ✅ Equal distribution algorithm
  - Divides economy allocation equally
  - Handles rounding correctly

- ✅ Unallocated fund tracking
  - Tracks unverified merchants
  - Calculates percentages
  - Per-economy breakdown

- ✅ Merchant categorization
  - Verified vs unverified vs no address
  - Only counts merchants in videos

- ✅ Video appearance counting
  - Accurate counts per merchant
  - Handles multiple appearances

- ✅ Multiple economies
  - Correct breakdowns
  - Accurate totals

- ✅ Edge cases
  - No merchants
  - All verified
  - All unverified
  - Zero allocation

**Run Tests**:
```bash
npm test -- merchant-funding-calculator.test.ts
```

**Expected Results**:
- Distribution algorithm accurate
- Totals always match (distributed + unallocated = total pool)
- Edge cases handled

---

### 3. CSV Export Tests

**Test Coverage**:
- ✅ Valid CSV format
- ✅ All required columns
- ✅ Special character escaping
- ✅ Empty records

**Expected Results**:
- CSV parses correctly
- Commas and quotes escaped
- Import-ready format

---

## Integration Tests

### 1. Address Verification API Tests

**File**: `__tests__/api-integration.test.ts`

**Test Endpoints**:

#### POST `/api/cbaf/admin/verify-merchant-address`
- ✅ Validates correct addresses
- ✅ Rejects invalid addresses
- ✅ Updates merchant records
- ✅ Requires authentication
- ✅ Validates input parameters

#### POST `/api/cbaf/admin/send-address-correction-email`
- ✅ Sends correction emails
- ✅ Fails if no contact email
- ✅ Validates parameters
- ✅ Handles SMTP errors

**Bulk Verification**:
- ✅ Multiple merchants in sequence
- ✅ Mixed valid/invalid addresses

**Run Tests**:
```bash
npm test -- api-integration.test.ts
```

---

### 2. Merchant Funding Calculation API Tests

**Test Endpoint**: POST `/api/cbaf/funding/calculate-merchant-level`

**Test Coverage**:
- ✅ Calculates merchant payments
- ✅ Returns economy breakdowns
- ✅ Returns payment records
- ✅ Calculates correct totals
- ✅ Tracks unallocated percentage
- ✅ Requires super admin auth
- ✅ Validates parameters
- ✅ Handles invalid periods

**Expected Response Structure**:
```json
{
  "success": true,
  "period": {...},
  "economyLevelAllocation": {...},
  "merchantLevelDistribution": {
    "totalPool": 10000000,
    "totalDistributed": 8500000,
    "totalUnallocated": 1500000,
    "unallocatedPercentage": "15.0",
    "economyBreakdowns": [...],
    "paymentRecords": [...],
    "summary": {...}
  }
}
```

---

## Manual Testing Workflow

### Test Scenario 1: Complete BCE → Admin → Super Admin Flow

#### Step 1: BCE Submits Video with Payment Addresses

1. **Login as BCE**
   - Navigate to `/cbaf/dashboard`
   - Click "Submit New Video"

2. **Fill Video Details**
   - Title: "Test Video - December 2025"
   - URL: Valid YouTube URL
   - Description: Testing payment verification

3. **Add Merchants with Payment Addresses**
   - **Merchant 1 (Verified Blink)**:
     - Name: "Mama Wanjiku's Shop"
     - Lightning: `test1@blink.sv`
     - Provider: Blink
     - ✅ Should show green checkmark after validation

   - **Merchant 2 (Verified Fedi)**:
     - Name: "John's Barber"
     - Lightning: `test2@fedi.xyz`
     - Provider: Fedi
     - ✅ Should show green checkmark

   - **Merchant 3 (Invalid Address)**:
     - Name: "Grace's Vegetables"
     - Lightning: `invalid@test.com`
     - Provider: Blink
     - ❌ Should show red X

   - **Merchant 4 (No Address)**:
     - Name: "Peter's Hardware"
     - Lightning: (leave empty)
     - ⚠️ Should show yellow warning

4. **Submit Video**
   - Video status: "Pending Review"

---

#### Step 2: Admin Reviews and Verifies Addresses

1. **Login as Admin**
   - Navigate to `/cbaf/admin/reviews`
   - Find test video

2. **Review Video**
   - Click video to open detail page
   - See merchant cards with payment addresses

3. **Use AddressVerificationPanel**
   - Panel shows all 4 merchants
   - See verification status:
     - ✅ Green: Verified
     - ❌ Red: Invalid
     - ⚠️ Yellow: Not provided

4. **Verify All Addresses**
   - Click "Verify All" button
   - Watch real-time validation progress
   - See updated status for each merchant

5. **Handle Invalid Address**
   - For invalid address, click "Send Correction Email"
   - Email sent to economy contact
   - Verify email received (check Gmail)

6. **Approve Video**
   - Click "Approve Video"
   - Video status → "Approved"

---

#### Step 3: Super Admin Calculates Merchant Payments

1. **Login as Super Admin**
   - Navigate to `/cbaf/super-admin/funding/allocate`

2. **Switch to Merchant-Level Tab**
   - Click "Merchant-Level Payments" tab

3. **Configure Funding Pool**
   - Enter: `10000000` (10M sats)
   - See USD conversion (~$3,500)

4. **Calculate Payments**
   - Click "Calculate Merchant Payments"
   - Wait for calculation

5. **Review Summary Cards**
   - **Distributed** (green): Total sats to verified merchants
   - **Unallocated** (yellow): Sats for unverified/missing
   - **Unverified** (red): Count of merchants
   - **No Address** (gray): Count of merchants

6. **Expand Economy Breakdowns**
   - Click economy card to expand
   - See all merchants in economy
   - See per-merchant payment details:
     - Name
     - Lightning address
     - Provider
     - Video appearances
     - Amount (sats)

7. **Check Unallocated Warning**
   - If >10% unallocated, yellow alert shows
   - Explains why funds not distributed

8. **Export CSV**
   - Click "Export X Merchant Payments to CSV"
   - Download: `cbaf-merchant-payments-2025-12.csv`
   - Open CSV, verify format:
     ```csv
     Lightning Address,Amount (sats),Merchant Name,Local Name,Provider,Economy,Video Appearances,Note
     test1@blink.sv,200000,Mama Wanjiku's Shop,Duka la Mama,blink,Kibera,2,VERIFIED
     ```

9. **Verify Calculations**
   - Total distributed + unallocated = 10M sats
   - Per-merchant amount = economy allocation / verified merchants
   - Unverified merchants NOT in payment list

---

### Test Scenario 2: Edge Cases

#### A. All Merchants Unverified
1. Submit video with all invalid addresses
2. Admin verifies → all fail
3. Super admin calculates
4. **Expected**: 100% unallocated, no payment records

#### B. Merchant Appears in Multiple Videos
1. Submit 3 videos with same merchant
2. Each video approved
3. Calculate payments
4. **Expected**: Merchant appears once with videoAppearances = 3

#### C. Economy with No Contact Email
1. Submit video from economy without contact email
2. Admin tries to send correction email
3. **Expected**: Button disabled or error message

#### D. Mix of Verified, Unverified, Missing
1. Submit video with:
   - 3 verified addresses
   - 2 unverified addresses
   - 2 no addresses
2. Calculate with 7M sats allocation
3. **Expected**:
   - Distributed: ~3M sats (to 3 verified)
   - Unallocated: ~4M sats (for 4 without verified)
   - Per merchant: ~1M sats

#### E. Zero Allocation Economy
1. Economy ranked last, receives 0 sats
2. **Expected**: No error, shows 0 distribution

---

## Test Data Requirements

### Economies (5 test economies)
- Kibera Test: Has contact email, mixed merchants
- Mathare Test: Has contact email, mixed merchants
- Kawangware Test: NO contact email
- Mukuru Test: All merchants verified
- Korogocho Test: No merchants have addresses

### Merchants (~25-30 total)
- **Verified (15)**:
  - 8 with Blink addresses
  - 4 with Fedi addresses
  - 3 with Machankura numbers

- **Unverified (8)**:
  - Invalid addresses

- **No Address (7)**:
  - Lightning address = null

### Videos (~20-25 total)
- Current month (2025-12)
- Status: Approved
- 2-4 merchants per video
- Some merchants appear in multiple videos

### Rankings
- Current month calculated
- All 5 economies ranked

---

## Success Criteria

### Phase A-C (Already Complete)
- ✅ Database migrations applied
- ✅ Payment validation service working
- ✅ Video form has address inputs
- ✅ Admin verification panel functional
- ✅ Email notifications sending

### Phase D (Current Focus)
- ✅ Merchant funding calculator algorithm correct
- ✅ API endpoint functional
- ✅ UI renders economy/merchant breakdowns
- ✅ CSV export generates valid format
- ✅ Unallocated funds tracked accurately
- ✅ Handles all edge cases gracefully

### Phase E (Testing)
- ✅ All unit tests pass (>90% coverage)
- ✅ All integration tests pass
- ✅ Manual workflow test complete
- ✅ All edge cases handled
- ✅ No runtime errors
- ✅ Performance acceptable (<5s calculations)

---

## Running All Tests

```bash
# Install dependencies
npm install

# Run all unit tests
npm test

# Run with coverage
npm test:coverage

# Run specific test file
npm test -- payment-validation.test.ts

# Watch mode (during development)
npm test:watch
```

---

## Test Results Documentation

### Unit Test Results
- [ ] Payment Validation: ___/__ tests passed
- [ ] Merchant Funding Calculator: ___/__ tests passed
- [ ] CSV Export: ___/__ tests passed

### Integration Test Results
- [ ] Address Verification API: ___/__ tests passed
- [ ] Merchant Funding API: ___/__ tests passed

### Manual Test Results
- [ ] Complete workflow: Pass/Fail
- [ ] Edge case A: Pass/Fail
- [ ] Edge case B: Pass/Fail
- [ ] Edge case C: Pass/Fail
- [ ] Edge case D: Pass/Fail
- [ ] Edge case E: Pass/Fail

### Issues Found
1. (List any bugs or issues discovered)
2. ...

### Known Limitations
1. Prerendering warnings on auth pages (non-critical)
2. ...

---

## Next Steps After Testing

1. **Fix any discovered issues**
2. **Update documentation**
3. **Create production deployment checklist**
4. **Performance optimization** (if needed)
5. **Security audit**
6. **User acceptance testing**

---

## Contact & Support

For issues or questions:
- GitHub Issues: [Repository issues]
- Development Team: [Contact info]

---

**Testing Status**: 🔄 In Progress
**Last Updated**: December 12, 2025
**Version**: Phase E Initial
