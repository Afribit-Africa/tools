# AFRIBITOOLS Complete Redesign Plan

## Overview

Complete overhaul of the application to use a **dark theme** throughout with modern UI components inspired by:
- **Aceternity UI** - Premium glassmorphism, gradients, and animations
- **Reactbits** - Interactive plasma effects, particle systems
- **PrismUI** - Clean card designs with subtle borders and shadows

## Design System

### 1. Color Palette (Dark Theme)

```css
/* Background Colors */
--bg-primary: #000000;        /* Pure black */
--bg-secondary: #0a0a0a;      /* Near black */
--bg-tertiary: #111111;       /* Dark gray */
--bg-card: #0d0d0d;           /* Card background */
--bg-elevated: #141414;       /* Elevated surfaces */

/* Border Colors */
--border-subtle: rgba(255, 255, 255, 0.05);
--border-default: rgba(255, 255, 255, 0.1);
--border-hover: rgba(255, 255, 255, 0.2);
--border-accent: rgba(247, 147, 26, 0.3);  /* Bitcoin orange */

/* Text Colors */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary: rgba(255, 255, 255, 0.5);
--text-muted: rgba(255, 255, 255, 0.3);

/* Accent Colors */
--bitcoin-500: #f7931a;
--bitcoin-400: #f9a541;
--bitcoin-600: #d97c0b;

/* Status Colors */
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
--info: #3b82f6;
```

### 2. Core Component Patterns

#### A. Glass Card (Aceternity Style)
```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
  {/* Content */}
</div>
```

#### B. Gradient Card (PrismUI Style)
```tsx
<div className="relative overflow-hidden bg-black rounded-2xl border border-white/10">
  {/* Gradient glow effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-bitcoin-500/20 via-transparent to-orange-500/10" />
  <div className="relative p-6">
    {/* Content */}
  </div>
</div>
```

#### C. Spotlight Card (Aceternity Hover)
```tsx
<div className="group relative bg-black rounded-2xl border border-white/10 p-6 transition-all hover:border-bitcoin-500/50">
  {/* Spotlight effect on hover */}
  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="absolute inset-0 bg-gradient-radial from-bitcoin-500/20 to-transparent" 
         style={{ transformOrigin: 'var(--mouse-x) var(--mouse-y)' }} />
  </div>
  {/* Content */}
</div>
```

### 3. Navigation Patterns

#### Floating Nav (Already Implemented)
```tsx
<nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
  {/* Nav items */}
</nav>
```

#### Sidebar Nav (For Dashboard)
```tsx
<aside className="fixed left-0 top-0 h-screen w-64 bg-black/80 backdrop-blur-xl border-r border-white/10">
  {/* Sidebar content */}
</aside>
```

### 4. Button Styles

#### Primary Button
```tsx
<button className="px-6 py-3 bg-gradient-to-r from-bitcoin-500 to-orange-500 hover:from-bitcoin-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]">
  Action
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all">
  Secondary
</button>
```

#### Ghost Button
```tsx
<button className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
  Ghost
</button>
```

---

## Superadmin Funding Restructure

### Current Flow (Complex)
1. Calculate monthly rankings → Generates ranking scores
2. Ranking determines funding percentage
3. Admin manually processes payments based on ranking

### New Flow (Simplified)
1. **Rankings** → Information display ONLY (leaderboard, stats)
2. **Bulk Funding** → Separate system entirely:
   - Collect all economy Blink/Lightning addresses
   - Run through Fastlight verification (removes whitespace, validates)
   - Superadmin sets flat amount per economy OR custom amounts
   - Batch send payments via Blink API

### New Database Considerations

No schema changes needed. We'll use:
- `economies.lightningAddress` - Already exists
- `fundingDisbursements` - For recording payments
- `superAdminSettings` - For Blink API key storage

### New API Endpoints

```
POST /api/cbaf/funding/collect-addresses
- Fetches all active economies with their Blink addresses
- Runs sanitization (whitespace removal)
- Returns prepared list for verification

POST /api/cbaf/funding/verify-batch
- Uses Fastlight verification logic
- Validates each Blink address
- Returns valid/invalid/fixed addresses

POST /api/cbaf/funding/send-batch
- Takes verified addresses with amounts
- Uses Blink API for batch payments
- Records disbursements in database
```

### New Page Structure

```
/cbaf/super-admin/funding/
├── page.tsx           → Overview with rankings info (display only)
├── bulk-payment/
│   └── page.tsx       → NEW: Bulk payment workflow
└── history/
    └── page.tsx       → Payment history
```

---

## Page Redesign Scope

### Priority 1: Core Pages
1. `/auth/signin` ✅ (Already dark themed)
2. `/cbaf/dashboard` → Dark theme, glass cards
3. `/cbaf/super-admin` → Complete dark overhaul
4. `/cbaf/super-admin/funding` → New bulk payment system
5. `/cbaf/rankings` → Dark theme leaderboard

### Priority 2: Admin Pages
6. `/cbaf/admin` → Dark theme
7. `/cbaf/admin/reviews` → Dark theme review cards
8. `/cbaf/merchants` → Dark theme merchant list

### Priority 3: Supporting Pages
9. `/fastlight` → Already functional, ensure dark consistency
10. `/` (Home) → Dark theme landing
11. `/privacy`, `/terms` → Dark theme

---

## Component Library to Build

### Core UI Components
```
components/ui-dark/
├── GlassCard.tsx          → Glassmorphism card
├── GradientCard.tsx       → Gradient background card
├── SpotlightCard.tsx      → Mouse-tracking spotlight
├── StatCard.tsx           → Stats display card
├── DataTable.tsx          → Dark themed table
├── Button.tsx             → All button variants
├── Badge.tsx              → Status badges
├── Input.tsx              → Form inputs
├── Select.tsx             → Dropdown selects
├── Modal.tsx              → Dark modal
├── Tabs.tsx               → Tab navigation
├── Progress.tsx           → Progress indicators
└── Toast.tsx              → Notification toasts
```

### Feature Components
```
components/funding/
├── AddressCollector.tsx   → Collect & display all addresses
├── AddressVerifier.tsx    → Fastlight verification integration
├── AmountAllocator.tsx    → Set payment amounts
├── BatchPaymentProcessor.tsx → Process payments
└── PaymentHistoryTable.tsx → View past payments
```

---

## Implementation Order

### Phase 1: Foundation (Today)
1. Create dark theme utility classes in globals.css
2. Build core GlassCard, GradientCard components
3. Build new bulk funding API endpoints
4. Create bulk payment page with Fastlight integration

### Phase 2: Superadmin Pages
5. Redesign funding overview page
6. Redesign rankings page (info-only)
7. Redesign superadmin dashboard

### Phase 3: Admin & BCE Pages  
8. Dashboard redesign
9. Merchant pages redesign
10. Review pages redesign

### Phase 4: Polish
11. Animations and transitions
12. Loading states
13. Error states
14. Mobile responsiveness (desktop-only warning already done)

---

## Key Principles

1. **Simplicity First** - Remove complexity, make actions obvious
2. **Dark & Professional** - Black backgrounds, subtle accents
3. **Glass Effects** - Backdrop blur for depth
4. **Bitcoin Orange Accents** - Primary accent color throughout
5. **Consistent Spacing** - Use 4px grid (p-1, p-2, p-4, p-6, p-8)
6. **Subtle Animations** - Smooth transitions, no jarring movements
7. **Clear Hierarchy** - Text opacity for importance levels

---

## File Changes Summary

### New Files to Create
- `components/ui-dark/*.tsx` (Component library)
- `app/cbaf/super-admin/funding/bulk-payment/page.tsx`
- `app/api/cbaf/funding/collect-addresses/route.ts`
- `app/api/cbaf/funding/verify-batch/route.ts`
- `app/api/cbaf/funding/send-batch/route.ts`

### Files to Modify
- `app/globals.css` (Dark theme utilities)
- `app/cbaf/super-admin/funding/page.tsx` (Rankings info only)
- `app/cbaf/rankings/page.tsx` (Dark theme, remove funding logic)
- `app/cbaf/dashboard/page.tsx` (Dark theme)
- All admin pages (Dark theme)
