# Code Quality Report & Unit Test Plan

## Overview
This document provides a comprehensive analysis of the Afribitools codebase, documenting architecture patterns, UI flows, and a complete testing strategy.

---

## 1. Architecture Overview

### Application Structure
```
app/
├── api/                    # API Routes
│   ├── auth/              # NextAuth endpoints
│   ├── cbaf/              # CBAF API (videos, merchants, funding)
│   └── fastlight/         # Fastlight verification API
├── auth/                  # Authentication pages
├── cbaf/                  # CBAF Module pages
│   ├── admin/             # Admin dashboard & reviews
│   ├── dashboard/         # BCE user dashboard
│   ├── merchants/         # Merchant management
│   ├── rankings/          # Public rankings
│   ├── setup/             # Economy setup
│   ├── super-admin/       # Super admin features
│   └── videos/            # Video submission
├── fastlight/             # Fastlight Module
└── page.tsx               # Homepage
```

### Tech Stack
- **Framework**: Next.js 16.0.10 (App Router + Turbopack)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks (useState, useEffect)
- **API**: REST endpoints with server actions

---

## 2. Code Quality Findings

### ✅ Strengths
1. **Consistent Design System**: Shared components in `/components/cbaf/` and `/components/ui/`
2. **Role-Based Access Control**: Clear separation of BCE, Admin, Super Admin roles
3. **Type Safety**: TypeScript throughout with proper interfaces
4. **API Structure**: Well-organized REST endpoints with proper error handling
5. **Database Schema**: Comprehensive Drizzle schema with proper relationships

### ⚠️ Areas for Improvement

#### API Endpoints
| Endpoint | Issue | Severity |
|----------|-------|----------|
| `/api/cbaf/funding/calculate` | Fixed: Missing `totalPool` in FundingConfig | ✅ Fixed |
| `/api/cbaf/videos/submit` | Fixed: Missing `Calendar` import | ✅ Fixed |

#### Component Issues
| Component | Issue | Status |
|-----------|-------|--------|
| `Alert.tsx` | Fixed: Nested `<p>` hydration error | ✅ Fixed |
| `VideoEmbed.tsx` | Twitter 404 detection added | ✅ Fixed |
| `ReviewForm.tsx` | Confirmation modal added | ✅ Fixed |

#### Suggested Improvements
1. **Add request validation**: Use Zod schemas for API input validation
2. **Implement rate limiting**: Add rate limits to public endpoints
3. **Add logging**: Structured logging for production debugging
4. **Error boundaries**: Add more granular error boundaries

---

## 3. UI Flow Patterns

### Authentication Flow
```
User → Google OAuth → Role Detection → Route to Dashboard
         ↓
    [BCE User] → Check economyName → Setup Page (if null)
         ↓
    [Admin] → Admin Dashboard
         ↓
    [Super Admin] → Full Access
```

### CBAF User Flow
```
1. Setup Economy → Register Merchants → Submit Videos → Await Review
2. Admin Reviews → Approve/Reject → Ranking Calculation
3. Super Admin → Funding Allocation → Payment Processing
```

### Component Patterns
- **Server Components**: Data fetching, authentication checks
- **Client Components**: Forms, modals, interactive elements
- **Shared Components**: Badge, Alert, EmptyState, StatCard
- **Floating Navigation**: Role-aware navigation dock

---

## 4. Unit Test Plan

### Testing Framework
- **Jest** for unit tests
- **React Testing Library** for component tests
- **Supertest** for API integration tests

### Test File Structure
```
__tests__/
├── api/
│   ├── auth.test.ts
│   ├── merchants.test.ts
│   ├── videos.test.ts
│   ├── funding.test.ts
│   └── payments.test.ts
├── components/
│   ├── Alert.test.tsx
│   ├── Badge.test.tsx
│   ├── VideoEmbed.test.tsx
│   └── ConfirmModal.test.tsx
├── lib/
│   ├── btcmap-verify.test.ts
│   ├── funding-calculator.test.ts
│   ├── payment-validator.test.ts
│   └── ranking-calculator.test.ts
└── setup.ts
```

### Priority Tests

#### P0 - Critical (Must Have)
| Test | File | Description |
|------|------|-------------|
| Payment Validation | `payment-validation.test.ts` | Validate Blink/Fedi addresses |
| Funding Calculator | `merchant-funding-calculator.test.ts` | Allocation accuracy |
| Auth Flow | `auth.test.ts` | Role detection, session handling |

#### P1 - High Priority
| Test | File | Description |
|------|------|-------------|
| Merchant Registration | `merchants.test.ts` | BTCMap verification, duplicate check |
| Video Submission | `videos.test.ts` | Duplicate detection, validation |
| Rankings | `ranking-calculator.test.ts` | Rank calculation accuracy |

#### P2 - Medium Priority
| Test | File | Description |
|------|------|-------------|
| Alert Component | `Alert.test.tsx` | Variants, accessibility |
| VideoEmbed | `VideoEmbed.test.tsx` | Platform detection, error states |
| CSV Import/Export | `csv.test.ts` | Parse, validate, export |

### Existing Tests Review
```
__tests__/
├── api-integration.test.ts      ✅ Good coverage
├── merchant-funding-calculator.test.ts  ✅ Good coverage
├── payment-validation.test.ts   ✅ Good coverage
└── setup.ts                     ✅ Proper test setup
```

---

## 5. Recommended New Tests

### `/api/cbaf/merchants/register` Test
```typescript
describe('Merchant Registration API', () => {
  test('should register merchant with valid BTCMap URL', async () => {
    // Test valid registration
  });

  test('should mark as verified for valid BTCMap format', async () => {
    // Test verification logic
  });

  test('should reject duplicate merchants', async () => {
    // Test duplicate detection
  });

  test('should validate lightning address format', async () => {
    // Test address validation
  });
});
```

### `/components/cbaf/VideoEmbed` Test
```typescript
describe('VideoEmbed Component', () => {
  test('should detect YouTube platform', () => {
    // Test YouTube URL detection
  });

  test('should detect Twitter/X platform', () => {
    // Test Twitter URL detection
  });

  test('should show loading state', () => {
    // Test loading indicator
  });

  test('should show error for invalid URLs', () => {
    // Test error handling
  });
});
```

### `/lib/cbaf/ranking-calculator` Test
```typescript
describe('Ranking Calculator', () => {
  test('should calculate ranks correctly', () => {
    // Test ranking algorithm
  });

  test('should handle ties in rankings', () => {
    // Test tie-breaking
  });

  test('should exclude rejected videos', () => {
    // Test filtering logic
  });
});
```

---

## 6. Implementation Priority

### Phase 1: Core Functionality
1. ✅ Fix build errors (completed)
2. Add Zod validation schemas
3. Expand payment validation tests
4. Add merchant API tests

### Phase 2: Components
1. Add component unit tests
2. Add accessibility tests
3. Add visual regression tests

### Phase 3: Integration
1. End-to-end flow tests
2. Database integration tests
3. Authentication flow tests

---

## 7. Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/payment-validation.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 8. Code Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| API Routes | ~40% | 80% |
| Components | ~20% | 70% |
| Utilities | ~60% | 90% |
| Overall | ~35% | 75% |

---

*Generated: December 14, 2025*
