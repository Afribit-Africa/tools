# CBAF Design System - Complete Overhaul Plan

**Date:** December 12, 2025
**Project:** Circular Bitcoin Africa Fund (CBAF) Platform
**Theme:** Light mode with Black & Bitcoin Orange branding

---

## 📋 Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Iconography](#iconography)
7. [Component Library](#component-library)
8. [BCE User Pages](#bce-user-pages)
9. [Admin Pages](#admin-pages)
10. [Responsive Design](#responsive-design)
11. [Implementation Plan](#implementation-plan)

---

## 🔍 Current State Analysis

### Existing Pages Inventory

#### BCE User Pages (6 pages)
1. **Setup** (`/cbaf/setup`) - BCE profile creation with country/city dropdowns
2. **Dashboard** (`/cbaf/dashboard`) - Economy overview with stats
3. **Submit Video** (`/cbaf/videos/submit`) - Video submission form with merchants
4. **Video History** (`/cbaf/videos`) - List of submitted videos
5. **Merchants** (`/cbaf/merchants`) - Economy's merchant network
6. **Register Merchant** (`/cbaf/merchants/register`) - Add new merchant

#### Admin Pages (7 pages)
1. **Admin Dashboard** (`/cbaf/admin`) - Overview for admins
2. **Reviews List** (`/cbaf/admin/reviews`) - All video submissions
3. **Review Detail** (`/cbaf/admin/reviews/[id]`) - Individual review page
4. **Economies** (`/cbaf/admin/economies`) - All BCE profiles
5. **Admin Merchants** (`/cbaf/admin/merchants`) - All merchants across economies
6. **Rankings** (`/cbaf/rankings`) - Monthly rankings
7. **Funding** (`/cbaf/super-admin/funding`) - Calculate & allocate funding

### Current Design Issues

1. **Dark Theme Everywhere** - Black backgrounds (#0A0A0A, #1A1A1A) don't highlight CBAF branding
2. **Inconsistent Spacing** - Mix of px-4, px-6, px-8 without systematic approach
3. **Limited Color Usage** - Bitcoin orange underutilized
4. **Generic Components** - No CBAF-specific visual identity
5. **Poor Visual Hierarchy** - Important actions blend into background
6. **Video Platform Focus** - Currently optimized for YouTube, but Twitter videos are primary

---

## 🎨 Design Philosophy

### Core Principles

**1. Clean & Professional**
Light backgrounds create a professional, trustworthy environment for financial operations.

**2. Bitcoin-Forward**
Bitcoin orange as the hero color, representing the circular economy and Bitcoin adoption.

**3. Video-First**
Since Twitter videos are primary, optimize for embedded tweet previews and social media links.

**4. Data-Driven**
Clear visualization of statistics, rankings, and funding allocation.

**5. African Context**
Design patterns that work well in African economies - fast loading, mobile-first, clear CTAs.

### Brand Identity

- **Primary Color:** Bitcoin Orange (#F7931A) - Energy, innovation, Bitcoin
- **Secondary Color:** Black (#000000) - Sophistication, strength, reliability
- **Background:** White (#FFFFFF) - Clarity, openness, transparency
- **Accent:** Light gray gradients for depth without darkness

---

## 🎨 Color System

### Core Palette

```javascript
colors: {
  // Base colors
  'white': '#FFFFFF',
  'black': '#000000',

  // Bitcoin Orange - Primary Brand Color
  'bitcoin': {
    50: '#FFF7ED',   // Lightest - backgrounds
    100: '#FFEDD5',  // Very light - hover states
    200: '#FED7AA',  // Light - borders
    300: '#FDBA74',  // Medium light
    400: '#FB923C',  // Medium
    500: '#F7931A',  // DEFAULT - Primary actions
    600: '#EA580C',  // Dark - hover on primary
    700: '#C2410C',  // Darker
    800: '#9A3412',  // Very dark
    900: '#7C2D12',  // Darkest
  },

  // Grayscale - Supporting Colors
  'gray': {
    50: '#F9FAFB',   // Page backgrounds
    100: '#F3F4F6',  // Card backgrounds
    200: '#E5E7EB',  // Borders
    300: '#D1D5DB',  // Disabled states
    400: '#9CA3AF',  // Muted text
    500: '#6B7280',  // Secondary text
    600: '#4B5563',  // Body text
    700: '#374151',  // Headings
    800: '#1F2937',  // Dark headings
    900: '#111827',  // Black text
  },

  // Status Colors
  'status': {
    success: '#10B981',   // Green - approved, verified
    warning: '#F59E0B',   // Amber - pending review
    error: '#EF4444',     // Red - rejected, errors
    info: '#3B82F6',      // Blue - information
  },

  // Social Platform Colors
  'social': {
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    tiktok: '#000000',
    instagram: '#E4405F',
  }
}
```

### Background Strategy

**Primary Backgrounds:**
- Main page: `white` or `gray-50`
- Cards: `white` with `gray-200` borders
- Hover states: `gray-100`

**Accent Backgrounds:**
- Bitcoin highlights: `bitcoin-50` or `bitcoin-100`
- Status indicators: Semi-transparent status colors

**Dark Elements:**
- Headers: `black` background with `white` text
- CTAs: `bitcoin-500` or `black` with appropriate contrast

---

## ✍️ Typography

### Font Stack

```javascript
fontFamily: {
  // Body text - Clean, highly readable
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],

  // Headings - Modern, distinctive
  heading: ['Space Grotesk', 'system-ui', 'sans-serif'],

  // Data/Stats - Monospace for numbers
  mono: ['JetBrains Mono', 'Consolas', 'monospace'],

  // Brand elements - CBAF logo, special headers
  brand: ['Audiowide', 'system-ui', 'sans-serif'],
}
```

### Type Scale

```javascript
fontSize: {
  // Body text
  'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px - Captions
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - Small text
  'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px - Body
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - Large body

  // Headings
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - H4
  '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px - H3
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - H2
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - H1
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px - Display
  '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px - Hero
}

fontWeight: {
  normal: 400,    // Body text
  medium: 500,    // Emphasis
  semibold: 600,  // Subheadings
  bold: 700,      // Headings
  extrabold: 800, // Display
}
```

### Usage Guidelines

**Headings:**
- Page titles: `text-4xl font-heading font-bold text-black`
- Section titles: `text-2xl font-heading font-semibold text-gray-900`
- Card titles: `text-xl font-heading font-semibold text-gray-800`

**Body Text:**
- Primary: `text-base font-sans text-gray-700`
- Secondary: `text-sm font-sans text-gray-500`
- Muted: `text-sm font-sans text-gray-400`

**Data/Stats:**
- Large numbers: `text-3xl font-mono font-bold text-black`
- Small numbers: `text-lg font-mono font-semibold text-gray-900`
- Currency: `text-base font-mono text-gray-700`

---

## 📐 Spacing & Layout

### Spacing Scale (Based on 4px)

```javascript
spacing: {
  '0': '0px',
  '1': '4px',     // Tight elements
  '2': '8px',     // Small gaps
  '3': '12px',    // Standard gaps
  '4': '16px',    // Default spacing
  '5': '20px',    // Medium spacing
  '6': '24px',    // Large spacing
  '7': '28px',    // Extra large
  '8': '32px',    // Section spacing
  '10': '40px',   // Major sections
  '12': '48px',   // Page sections
  '16': '64px',   // Large page sections
  '20': '80px',   // Hero sections
  '24': '96px',   // Extra large sections
}
```

### Layout Patterns

**Page Wrapper:**
```html
<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-black text-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header content -->
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page content -->
  </main>
</div>
```

**Card Pattern:**
```html
<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
  <!-- Card content -->
</div>
```

**Grid Layouts:**
```html
<!-- 3-column stat grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Grid items -->
</div>

<!-- 2-column content grid -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2"><!-- Main content --></div>
  <div class="lg:col-span-1"><!-- Sidebar --></div>
</div>
```

### Container Sizes

- **Max Width:** `max-w-7xl` (1280px) - Main content
- **Forms:** `max-w-2xl` (672px) - Optimal form width
- **Reading:** `max-w-4xl` (896px) - Comfortable reading width
- **Wide:** `max-w-full` - Full width tables/lists

---

## 🎯 Iconography

### Icon Library: Lucide React

**Reasoning:** Already installed, comprehensive, consistent style, tree-shakeable

### Icon Sizes

```javascript
iconSizes: {
  'xs': 'w-3 h-3',   // 12px - Inline badges
  'sm': 'w-4 h-4',   // 16px - Buttons, labels
  'base': 'w-5 h-5', // 20px - Default
  'lg': 'w-6 h-6',   // 24px - Section headers
  'xl': 'w-8 h-8',   // 32px - Feature icons
  '2xl': 'w-12 h-12', // 48px - Empty states
  '3xl': 'w-16 h-16', // 64px - Hero icons
}
```

### Icon Mapping by Category

**Navigation & Actions:**
- Home: `Home`
- Back: `ArrowLeft`
- Forward: `ArrowRight`
- Close: `X`
- Menu: `Menu`
- Settings: `Settings`
- Help: `HelpCircle`

**CBAF Specific:**
- Economy/BCE: `Building2`, `Landmark`
- Video: `Video`, `Film`
- Merchants: `Store`, `ShoppingBag`
- Rankings: `Trophy`, `Award`, `TrendingUp`
- Funding: `DollarSign`, `Coins`, `Wallet`
- Bitcoin: Custom SVG (₿ symbol)

**Status Indicators:**
- Success/Approved: `CheckCircle`
- Pending: `Clock`
- Rejected/Error: `XCircle`
- Warning: `AlertTriangle`
- Info: `Info`

**Data & Content:**
- Calendar: `Calendar`
- Location: `MapPin`
- External Link: `ExternalLink`
- Link: `Link`
- Stats: `BarChart3`, `LineChart`
- User: `User`, `Users`

**Media Platforms:**
- Twitter/X: `Twitter` (or custom X logo)
- YouTube: `Youtube`
- Video generic: `Video`
- Play: `Play`

---

## 🧩 Component Library

### 1. Buttons

**Primary Button (CTAs):**
```html
<button class="inline-flex items-center gap-2 px-6 py-3 bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
  <Icon class="w-4 h-4" />
  Submit Video
</button>
```

**Secondary Button:**
```html
<button class="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold border border-gray-300 rounded-lg shadow-sm transition-all duration-200">
  <Icon class="w-4 h-4" />
  View Details
</button>
```

**Outline Button:**
```html
<button class="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-bitcoin-50 text-bitcoin-600 font-semibold border-2 border-bitcoin-500 rounded-lg transition-all duration-200">
  <Icon class="w-4 h-4" />
  Add Merchant
</button>
```

**Ghost Button:**
```html
<button class="inline-flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors duration-200">
  <Icon class="w-4 h-4" />
  Cancel
</button>
```

**Danger Button:**
```html
<button class="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all duration-200">
  <Icon class="w-4 h-4" />
  Reject
</button>
```

### 2. Form Inputs

**Text Input:**
```html
<div class="space-y-2">
  <label class="block text-sm font-semibold text-gray-700">
    Economy Name <span class="text-red-500">*</span>
  </label>
  <input
    type="text"
    class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent transition-all"
    placeholder="Enter your economy name"
  />
  <p class="text-xs text-gray-500">This will be visible on your public profile</p>
</div>
```

**Select Dropdown:**
```html
<select class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent appearance-none cursor-pointer">
  <option>Select country</option>
  <option>Kenya 🇰🇪</option>
  <option>South Africa 🇿🇦</option>
</select>
```

**Textarea:**
```html
<textarea
  rows="4"
  class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent resize-none transition-all"
  placeholder="Describe your video..."
></textarea>
```

**Input with Icon:**
```html
<div class="relative">
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Icon class="w-5 h-5 text-gray-400" />
  </div>
  <input
    type="text"
    class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500"
    placeholder="Search..."
  />
</div>
```

### 3. Cards

**Stat Card:**
```html
<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <div class="p-3 bg-bitcoin-100 rounded-lg">
        <Icon class="w-6 h-6 text-bitcoin-600" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-500">Total Videos</p>
        <p class="text-3xl font-bold font-mono text-black mt-1">24</p>
      </div>
    </div>
  </div>
  <div class="flex items-center gap-2 text-sm">
    <TrendingUp class="w-4 h-4 text-green-500" />
    <span class="text-green-600 font-semibold">+12%</span>
    <span class="text-gray-500">vs last month</span>
  </div>
</div>
```

**Content Card:**
```html
<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
  <div class="flex items-start justify-between mb-4">
    <h3 class="text-lg font-heading font-semibold text-gray-900">Card Title</h3>
    <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
      Approved
    </span>
  </div>
  <p class="text-sm text-gray-600 mb-4">Card description goes here...</p>
  <div class="flex items-center justify-between pt-4 border-t border-gray-200">
    <span class="text-xs text-gray-500">Dec 12, 2025</span>
    <button class="text-sm text-bitcoin-600 hover:text-bitcoin-700 font-semibold">
      View Details →
    </button>
  </div>
</div>
```

### 4. Status Badges

```html
<!-- Approved -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
  <CheckCircle class="w-3 h-3" />
  Approved
</span>

<!-- Pending -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
  <Clock class="w-3 h-3" />
  Pending
</span>

<!-- Rejected -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
  <XCircle class="w-3 h-3" />
  Rejected
</span>

<!-- Verified -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
  <CheckCircle class="w-3 h-3" />
  Verified
</span>
```

### 5. Alert Boxes

```html
<!-- Success -->
<div class="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
  <CheckCircle class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 class="text-sm font-semibold text-green-900">Success!</h4>
    <p class="text-sm text-green-700 mt-1">Your video has been submitted for review.</p>
  </div>
</div>

<!-- Error -->
<div class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
  <XCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 class="text-sm font-semibold text-red-900">Error</h4>
    <p class="text-sm text-red-700 mt-1">Failed to submit video. Please try again.</p>
  </div>
</div>

<!-- Info -->
<div class="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 class="text-sm font-semibold text-blue-900">Information</h4>
    <p class="text-sm text-blue-700 mt-1">Videos are reviewed within 48 hours.</p>
  </div>
</div>
```

### 6. Empty States

```html
<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <Icon class="w-8 h-8 text-gray-400" />
  </div>
  <h3 class="text-xl font-heading font-semibold text-gray-900 mb-2">No videos yet</h3>
  <p class="text-sm text-gray-500 mb-6 max-w-md">
    Start building your portfolio by submitting your first Proof of Work video
  </p>
  <button class="btn-primary">
    <Video class="w-4 h-4" />
    Submit Your First Video
  </button>
</div>
```

### 7. Loading States

```html
<!-- Spinner -->
<div class="flex items-center justify-center py-8">
  <div class="w-8 h-8 border-4 border-gray-200 border-t-bitcoin-500 rounded-full animate-spin"></div>
</div>

<!-- Skeleton Card -->
<div class="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
  <div class="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
</div>
```

---

## 👤 BCE User Pages

### 1. Setup Page (`/cbaf/setup`)

**Purpose:** First-time BCE profile creation

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  "Welcome to CBAF" (white text)        │
│  "Create your economy profile"         │
└─────────────────────────────────────────┘
│                                         │
│  ┌───────────────────────────────┐    │
│  │  WHITE FORM CARD (max-w-2xl)  │    │
│  │                                │    │
│  │  Economy Name [_______]        │    │
│  │  Slug [_______] ✓             │    │
│  │  Country [▼ Kenya 🇰🇪]         │    │
│  │  City [▼ Nairobi]              │    │
│  │  Description [________]        │    │
│  │  Website [_______]             │    │
│  │  Twitter [_______]             │    │
│  │  Telegram [_______]            │    │
│  │  Lightning ⚡ [_______]        │    │
│  │                                │    │
│  │  [ORANGE BUTTON: Create Profile]│   │
│  └───────────────────────────────┘    │
│                                         │
│  INFO BOX (bitcoin-50 bg)              │
│  "Your profile will be public..."      │
└─────────────────────────────────────────┘
```

**Key Features:**
- Black header with white CBAF branding
- Clean white form on gray-50 background
- Real-time slug validation with green checkmark
- Country flags in dropdown
- Bitcoin orange primary button
- Info box at bottom with light orange background

**Spacing:**
- Form container: `max-w-2xl mx-auto`
- Form padding: `p-8`
- Field spacing: `space-y-6`
- Button: `mt-8`

### 2. Dashboard (`/cbaf/dashboard`)

**Purpose:** Economy overview and quick actions

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  Economy Name        [Submit Video] CTA │
│  Nairobi, Kenya      [Add Merchant]     │
└─────────────────────────────────────────┘
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 24   │ │ 18   │ │ 15   │ │ #3   │ │
│  │Videos│ │Approve│ │Merchants│Rank │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │
│   Stat Cards (4 columns)              │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Recent Videos                  │  │
│  │  ┌─────────────────────────┐   │  │
│  │  │ Video Card 1 [Pending]  │   │  │
│  │  └─────────────────────────┘   │  │
│  │  ┌─────────────────────────┐   │  │
│  │  │ Video Card 2 [Approved] │   │  │
│  │  └─────────────────────────┘   │  │
│  └─────────────────────────────────┘  │
│                                         │
│  SIDEBAR:                               │
│  - Current Month Ranking               │
│  - Next Steps / Actions                │
└─────────────────────────────────────────┘
```

**Key Features:**
- Black header with economy details
- Orange CTAs (Submit Video, Add Merchant)
- 4-column stat grid with icon + number
- Recent videos list with status badges
- Ranking card with trophy icon
- Clear visual hierarchy

**Components:**
- Stat cards with bitcoin-100 icon backgrounds
- Status badges (green/yellow/red)
- Video cards with thumbnail placeholders
- Progress bars for rankings

### 3. Submit Video (`/cbaf/videos/submit`)

**Purpose:** Submit Proof of Work videos with merchant features

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  "Submit Video"      [← Back]           │
│  "Submit your Proof of Work video"     │
└─────────────────────────────────────────┘
│                                         │
│  ┌───────────────────────────────┐    │
│  │  WHITE FORM CARD              │    │
│  │                                │    │
│  │  Video URL * [______] 🔄       │    │
│  │  ↳ Twitter, YouTube supported  │    │
│  │                                │    │
│  │  Title * [_______________]     │    │
│  │                                │    │
│  │  Description [________]        │    │
│  │                                │    │
│  │  Funding Month * [Dec 2025 ▼] │    │
│  │                                │    │
│  │  Merchants Featured * ────────│    │
│  │  [BTCMap URL ▼] [Local Name] ✕│    │
│  │  [BTCMap URL ▼] [Local Name] ✕│    │
│  │  + Add another merchant        │    │
│  │                                │    │
│  │  [ORANGE: Submit for Review]   │    │
│  └───────────────────────────────┘    │
│                                         │
│  INFO BOX                               │
│  "Videos reviewed within 48hrs"        │
│  "Twitter videos preferred"            │
└─────────────────────────────────────────┘
```

**Key Features:**
- Real-time duplicate detection (with spinner)
- Video platform auto-detect (Twitter icon if Twitter URL)
- Multiple merchant input fields
- Dynamic add/remove merchants
- BTCMap link with external icon
- Clear required field markers (*)
- Success state with animation after submit

**Validation:**
- URL format validation
- Duplicate video check
- At least one merchant required
- Visual feedback for each validation

### 4. Video History (`/cbaf/videos`)

**Purpose:** View all submitted videos and their status

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  "Your Videos"       [Submit New Video] │
│  24 videos submitted                   │
└─────────────────────────────────────────┘
│                                         │
│  FILTER TABS                            │
│  [All] [Pending] [Approved] [Rejected] │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ Video Card                       │  │
│  │ ┌───────┐  Title        [Approved]│ │
│  │ │ IMG   │  3 merchants           │  │
│  │ │ 📹    │  Dec 10, 2025         │  │
│  │ └───────┘  [View Details →]     │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ Video Card                       │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [Load More] or Pagination             │
└─────────────────────────────────────────┘
```

**Key Features:**
- Filter tabs with counts
- Grid or list view toggle
- Video thumbnail or platform icon
- Status badge prominent
- Merchant count display
- Quick actions (View, Edit if pending)

**Interactions:**
- Click card → video detail page
- Hover → subtle shadow lift
- Filter → instant update

### 5. Merchants (`/cbaf/merchants`)

**Purpose:** View economy's merchant network

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  "Your Merchants"    [Add Merchant]     │
│  15 merchants registered               │
└─────────────────────────────────────────┘
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Card 1│ │Card 2│ │Card 3│  (3-col grid)│
│  │      │ │      │ │      │           │
│  │Name  │ │Name  │ │Name  │           │
│  │✓Verif│ │⚠️Pend│ │✕Error│          │
│  │5 vids│ │2 vids│ │0 vids│          │
│  └──────┘ └──────┘ └──────┘           │
│                                         │
│  INFO BOX                               │
│  "Merchants appear in videos..."       │
└─────────────────────────────────────────┘
```

**Key Features:**
- 3-column grid (responsive)
- Merchant cards with verification status
- Video appearance count
- BTCMap link
- Category badge
- Location (city, country)

**Card States:**
- Verified: Green checkmark + green border
- Pending: Yellow clock icon
- Error: Red X with error tooltip

### 6. Register Merchant (`/cbaf/merchants/register`)

**Purpose:** Add new merchant to economy

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  "Add Merchant"      [← Back]           │
└─────────────────────────────────────────┘
│                                         │
│  ┌───────────────────────────────┐    │
│  │  WHITE FORM CARD              │    │
│  │                                │    │
│  │  BTCMap URL * [_______] 🔗    │    │
│  │  ↳ Paste merchant URL from BTCMap│  │
│  │                                │    │
│  │  Local Name [_______]          │    │
│  │  (Optional custom name)        │    │
│  │                                │    │
│  │  Notes [________]              │    │
│  │  (Internal notes)              │    │
│  │                                │    │
│  │  [ORANGE: Register Merchant]   │    │
│  └───────────────────────────────┘    │
│                                         │
│  INFO BOX                               │
│  "Merchant verified against BTCMap"    │
│  "Can be featured in videos"           │
└─────────────────────────────────────────┘
```

**Key Features:**
- Simple, focused form
- BTCMap URL validation
- Auto-fetch merchant details if valid
- Preview merchant info before save
- Success state with redirect

---

## 👨‍💼 Admin Pages

### 1. Admin Dashboard (`/cbaf/admin`)

**Purpose:** Overview for admins and super admins

**Layout:**
```
┌─────────────────────────────────────────┐
│  BLACK HEADER                           │
│  "Admin Dashboard"   [View as Admin ▼] │
│  Welcome, Edmund                       │
└─────────────────────────────────────────┘
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 12   │ │ 56   │ │ 142  │ │ ₿500 │ │
│  │Pending│ │Total │ │Merch │ │Funding││
│  └──────┘ └──────┘ └──────┘ └──────┘ │
│                                         │
│  Quick Actions Grid:                   │
│  ┌─────────────────┐ ┌──────────────┐│
│  │ 📹 Review Videos │ │ 🏆 Rankings  ││
│  └─────────────────┘ └──────────────┘│
│  ┌─────────────────┐ ┌──────────────┐│
│  │ 🏢 Economies    │ │ 💰 Funding   ││
│  └─────────────────┘ └──────────────┘│
│                                         │
│  Recent Activity Feed                  │
└─────────────────────────────────────────┘
```

**Key Features:**
- Role badge (Admin/Super Admin)
- High-level stats
- Quick action cards (large, tappable)
- Activity feed with avatars
- Pending count highlighted in yellow

### 2. Reviews List (`/cbaf/admin/reviews`)

**Purpose:** All video submissions for review

**Layout:**
```
┌─────────────────────────────────────────┐
│  "Video Reviews"     [← Admin Dashboard]│
│                                         │
│  [All 56] [Pending 12] [Approved 40] [Rej 4]│
│  Filter tabs                            │
└─────────────────────────────────────────┘
│                                         │
│  Table View:                            │
│  ┌────────────────────────────────────┐│
│  │ Economy | Video | Merchants | Status│ │
│  ├────────────────────────────────────┤│
│  │ Nairobi | Video1 | 3 | [Pending] │ │
│  │ Lagos   | Video2 | 5 | [Approved]│ │
│  └────────────────────────────────────┘│
│                                         │
│  Or Card View (mobile):                │
│  ┌─────────────────────────────────┐  │
│  │ Nairobi Economy                  │  │
│  │ Video 1 • 3 merchants [Pending]  │  │
│  │ [Review →]                       │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Key Features:**
- Filterable by status
- Sortable columns
- Bulk actions (select multiple → approve/reject)
- Economy name linked to economy page
- Click row → review detail page

### 3. Review Detail (`/cbaf/admin/reviews/[id]`)

**Purpose:** Review individual video submission

**Layout:**
```
┌─────────────────────────────────────────┐
│  "Review Video"      [← Back to List]   │
└─────────────────────────────────────────┘
│                                         │
│  2-Column Layout:                       │
│  ┌─────────────────┐ ┌──────────────┐ │
│  │ VIDEO EMBED     │ │ DETAILS      │ │
│  │ (Twitter/YT)    │ │              │ │
│  │                 │ │ Economy:     │ │
│  │ 📹 [Play]      │ │ Nairobi      │ │
│  │                 │ │              │ │
│  │                 │ │ Submitted:   │ │
│  │                 │ │ Dec 10, 2025 │ │
│  │                 │ │              │ │
│  └─────────────────┘ │ Merchants:   │ │
│                       │ - Cafe 1 ✓   │ │
│  REVIEW FORM:         │ - Shop 2 ✓   │ │
│  ┌─────────────────┐ │              │ │
│  │ Admin Comments  │ └──────────────┘ │
│  │ [__________]    │                  │
│  │                 │ ACTION BUTTONS:  │
│  │ [GREEN: Approve]│ [ORANGE: Approve]│
│  │ [RED: Reject]   │ [RED: Reject]    │
│  └─────────────────┘                  │
└─────────────────────────────────────────┘
```

**Key Features:**
- Large video embed (Twitter preferred)
- Merchant list with verification status
- Economy info sidebar
- Admin comment textarea
- Approve/Reject buttons (clear, large)
- Confirmation modal before action

### 4. Economies List (`/cbaf/admin/economies`)

**Purpose:** View all BCE profiles

**Layout:**
```
┌─────────────────────────────────────────┐
│  "All Economies"     Search: [_____] 🔍 │
│  42 economies registered               │
└─────────────────────────────────────────┘
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ Nairobi BCE                      │  │
│  │ Kenya 🇰🇪 • 24 videos • 15 merchants│ │
│  │ Rank: #3 • Active                │  │
│  │ [View Profile →]                 │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ Lagos BCE                        │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Key Features:**
- Search bar
- Economy cards with key stats
- Country flags
- Activity status (Active/Inactive)
- Link to economy's public profile

### 5. Admin Merchants (`/cbaf/admin/merchants`)

**Purpose:** All merchants across all economies

**Layout:**
```
┌─────────────────────────────────────────┐
│  "All Merchants"     [Bulk Verify]      │
│  142 merchants • 89% verified          │
│                                         │
│  Filter: [✓ Verified] [⚠️ Unverified]  │
└─────────────────────────────────────────┘
│                                         │
│  Table View:                            │
│  ┌────────────────────────────────────┐│
│  │ Name | Economy | Videos | Status   ││
│  ├────────────────────────────────────┤│
│  │ Cafe 1 | Nairobi | 12 | ✓ Verified││
│  │ Shop 2 | Lagos | 5 | ⚠️ Pending   ││
│  └────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Key Features:**
- Filter by verification status
- Bulk verify action
- Sort by appearances
- Link to BTCMap
- Economy association

### 6. Rankings (`/cbaf/rankings`)

**Purpose:** Monthly rankings for all economies

**Layout:**
```
┌─────────────────────────────────────────┐
│  "Monthly Rankings"  [Month: Dec 2025 ▼]│
└─────────────────────────────────────────┘
│                                         │
│  Leaderboard:                           │
│  ┌─────────────────────────────────┐  │
│  │ 🥇 #1 Nairobi                   │  │
│  │    24 videos • 15 merchants      │  │
│  │    Score: 450 points            │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 🥈 #2 Lagos                     │  │
│  │    18 videos • 12 merchants      │  │
│  │    Score: 380 points            │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ 🥉 #3 Cape Town                 │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [Calculate Rankings for Next Month]   │
└─────────────────────────────────────────┘
```

**Key Features:**
- Month selector
- Trophy icons for top 3
- Clear scoring display
- Visual ranking hierarchy (card size, color)
- Calculate button for admins

### 7. Funding (`/cbaf/super-admin/funding`)

**Purpose:** Calculate and allocate funding (super admin only)

**Layout:**
```
┌─────────────────────────────────────────┐
│  "Funding Allocation" [Super Admin]     │
└─────────────────────────────────────────┘
│                                         │
│  Step 1: Calculate Rankings             │
│  ┌─────────────────────────────────┐  │
│  │ Month: Dec 2025                  │  │
│  │ [ORANGE: Calculate Rankings]     │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Step 2: Allocate Funding               │
│  ┌─────────────────────────────────┐  │
│  │ Total Pool: ₿ [_____]           │  │
│  │ Distribution formula:            │  │
│  │ Rank-based + Merit-based        │  │
│  │                                  │  │
│  │ Preview:                         │  │
│  │ #1 Nairobi: ₿150                │  │
│  │ #2 Lagos: ₿120                  │  │
│  │ #3 Cape Town: ₿100              │  │
│  │                                  │  │
│  │ [ORANGE: Allocate Funding]      │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Step 3: Export & Save                  │
│  ┌─────────────────────────────────┐  │
│  │ [Download Fastlight CSV]        │  │
│  │ [Save to Database]              │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Key Features:**
- Step-by-step wizard
- Rankings calculation preview
- Funding pool input (Bitcoin)
- Distribution preview table
- Export CSV for Fastlight
- Save disbursements to DB
- Confirmation modals

---

## 📱 Responsive Design

### Breakpoints

```javascript
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Mobile-First Approach

**Grid Adjustments:**
- 4-column stats → 2-column on tablet → 1-column on mobile
- 3-column merchants → 2-column on tablet → 1-column on mobile
- Side-by-side forms → stacked on mobile

**Navigation:**
- Desktop: Horizontal menu in header
- Mobile: Hamburger menu with slide-out drawer

**Tables:**
- Desktop: Full table with all columns
- Tablet: Hide non-essential columns
- Mobile: Convert to card view

**Forms:**
- Desktop: 2-column layouts where appropriate
- Mobile: Single column, full width

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Day 1)

**Tasks:**
1. Update `tailwind.config.js` with new color system
2. Update `globals.css` with new component classes
3. Create shared component directory structure:
   ```
   components/cbaf/
   ├── ui/
   │   ├── Button.tsx
   │   ├── Input.tsx
   │   ├── Card.tsx
   │   ├── Badge.tsx
   │   ├── Alert.tsx
   │   └── EmptyState.tsx
   ├── layout/
   │   ├── Header.tsx
   │   ├── PageWrapper.tsx
   │   └── Container.tsx
   └── shared/
       ├── StatCard.tsx
       ├── VideoCard.tsx
       ├── MerchantCard.tsx
       └── LoadingState.tsx
   ```

**Deliverables:**
- New design tokens in Tailwind
- Base component library
- Layout components

### Phase 2: BCE User Pages (Days 2-3)

**Rebuild Order:**
1. Setup page (simplest, test foundation)
2. Dashboard (stat cards, layout patterns)
3. Merchants page (grid, cards)
4. Submit video (complex form)
5. Video history (list, filters)
6. Register merchant (simple form)

**Approach:**
- Keep existing routes/APIs
- Replace only UI/styling
- Maintain all functionality
- Add new components as needed

### Phase 3: Admin Pages (Days 4-5)

**Rebuild Order:**
1. Admin dashboard (action cards, stats)
2. Economies list (search, cards)
3. Admin merchants (table, bulk actions)
4. Reviews list (filters, table)
5. Review detail (complex layout)
6. Rankings (leaderboard)
7. Funding (wizard, super admin)

**Approach:**
- Admin-specific header variant
- Role-based styling (admin vs super admin)
- Bulk action patterns
- Data tables with sorting

### Phase 4: Polish & Testing (Day 6)

**Tasks:**
1. Responsive testing (mobile, tablet, desktop)
2. Loading states everywhere
3. Empty states for all lists
4. Error handling UI
5. Success animations
6. Accessibility audit (keyboard nav, screen readers)
7. Performance audit (image loading, code splitting)
8. Cross-browser testing

### Phase 5: Documentation (Day 7)

**Create:**
1. Component documentation (Storybook or similar)
2. Design system usage guide
3. Screenshot all pages for reference
4. Update README with new design info

---

## 📝 Design Decisions & Rationale

### Why Light Theme?

1. **Professional Trust:** Financial platforms benefit from light, clean aesthetics
2. **Brand Visibility:** Bitcoin orange pops more on white than on dark backgrounds
3. **Readability:** Better for data-heavy pages (stats, tables, forms)
4. **Print-Friendly:** Easier to screenshot/print for documentation
5. **Energy:** Light themes feel more energetic and optimistic

### Why Bitcoin Orange as Primary?

1. **Brand Recognition:** Universally associated with Bitcoin
2. **Energy & Action:** Warm color drives engagement and CTAs
3. **CBAF Identity:** Circular Bitcoin Africa Fund = Bitcoin-first branding
4. **Contrast:** Works well with both black and white
5. **Accessibility:** Sufficient contrast ratios when used correctly

### Why Space Grotesk for Headings?

1. **Modern & Tech-Forward:** Geometric sans-serif feels contemporary
2. **Distinctive:** Sets CBAF apart from generic platforms
3. **Bitcoin Community:** Popular in Bitcoin/crypto design systems
4. **Readability:** Clear at all sizes
5. **Web-Optimized:** Excellent rendering on screens

### Why Video Embed Focus?

1. **User Behavior:** Twitter videos are the primary content type
2. **Proof of Work:** Visual verification is key to CBAF model
3. **Engagement:** Embedded videos increase review accuracy
4. **Social Proof:** Shows actual merchant interactions
5. **Platform Native:** Feels like native Twitter/YouTube experience

---

## 🎯 Success Metrics

**After Implementation:**

1. **Visual Consistency:** All pages follow design system
2. **Brand Strength:** CBAF has distinct, recognizable visual identity
3. **User Clarity:** No confusion about actions or status
4. **Mobile Experience:** Fully functional on all devices
5. **Performance:** Fast loading, smooth interactions
6. **Accessibility:** WCAG 2.1 AA compliance
7. **Code Quality:** Reusable components, minimal duplication

---

## 🔄 Future Enhancements

**Post-Launch Improvements:**

1. **Dark Mode Toggle:** Optional dark theme for user preference
2. **Custom Themes:** Economy-specific color schemes
3. **Advanced Analytics:** Charts and graphs for trends
4. **Real-time Updates:** WebSocket for live status changes
5. **Video Preview:** In-line video playback without leaving page
6. **Advanced Filters:** Multi-select, date ranges, custom queries
7. **Batch Operations:** Bulk approve, bulk allocate funding
8. **Mobile App:** Native iOS/Android with same design system

---

## 📚 References & Inspiration

**Design Systems:**
- Stripe Dashboard (clean, data-driven)
- Linear (modern, fast, intuitive)
- Notion (flexible layouts, clear hierarchy)
- Bitcoin Design Community (Bitcoin-specific patterns)

**Color Psychology:**
- Orange: Energy, enthusiasm, attraction, creativity
- Black: Power, elegance, formality, sophistication
- White: Purity, cleanliness, simplicity, space

**Typography:**
- Inter: Used by GitHub, Stripe, Linear (proven reliability)
- Space Grotesk: Used by Bitcoin Design, crypto platforms
- JetBrains Mono: Developer favorite, excellent for data

---

**Document Version:** 1.0
**Last Updated:** December 12, 2025
**Status:** Ready for Implementation
**Next Step:** Begin Phase 1 - Foundation Setup
