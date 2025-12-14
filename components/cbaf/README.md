# CBAF Component Library

Reusable React components for the Circular Bitcoin Africa Fund platform, built with TypeScript, Tailwind CSS, and Lucide React icons.

## 📁 Structure

```
components/cbaf/
├── ui/              # Basic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   └── EmptyState.tsx
├── layout/          # Layout components
│   ├── PageWrapper.tsx
│   ├── Header.tsx
│   └── Container.tsx
├── shared/          # Shared/composite components
│   ├── StatCard.tsx
│   └── LoadingState.tsx
└── index.ts         # Main export file
```

## 🎨 Design System

All components follow the CBAF design system with:
- **Colors**: Light theme with Bitcoin Orange (#F7931A), Black accents, White backgrounds
- **Typography**: Inter (body), Space Grotesk (headings), JetBrains Mono (data)
- **Spacing**: 4px-based scale
- **Icons**: Lucide React

## 📦 Usage

### Import Components

```tsx
import { Button, Input, Card, Badge, Alert, EmptyState } from '@/components/cbaf';
```

### Button

```tsx
import { Button } from '@/components/cbaf';
import { Video } from 'lucide-react';

<Button variant="primary" icon={Video}>
  Submit Video
</Button>

<Button variant="secondary" size="sm">
  Cancel
</Button>

<Button variant="outline" loading>
  Processing...
</Button>

<Button variant="danger">
  Delete
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: LucideIcon
- `iconPosition`: 'left' | 'right'

### Input

```tsx
import { Input } from '@/components/cbaf';
import { Mail } from 'lucide-react';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  icon={Mail}
  required
  helperText="We'll never share your email"
/>

<Input
  label="Economy Name"
  error="This field is required"
  required
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `icon`: LucideIcon
- `iconPosition`: 'left' | 'right'
- `required`: boolean

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/cbaf';

<Card hover>
  <CardHeader>
    <CardTitle>Video Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Video description goes here...</p>
  </CardContent>
  <CardFooter>
    <button>View Details</button>
  </CardFooter>
</Card>
```

**Props:**
- `hover`: boolean - Adds hover effect

### Badge

```tsx
import { Badge } from '@/components/cbaf';
import { CheckCircle } from 'lucide-react';

<Badge variant="success" icon={CheckCircle}>
  Approved
</Badge>

<Badge variant="warning">Pending</Badge>
<Badge variant="error">Rejected</Badge>
<Badge variant="info">Under Review</Badge>
<Badge variant="bitcoin">Bitcoin</Badge>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'bitcoin'
- `icon`: LucideIcon

### Alert

```tsx
import { Alert } from '@/components/cbaf';

<Alert variant="success" title="Success!">
  Your video has been submitted for review.
</Alert>

<Alert variant="error" title="Error">
  Failed to submit video. Please try again.
</Alert>

<Alert variant="warning" title="Warning">
  This action cannot be undone.
</Alert>

<Alert variant="info">
  Videos are reviewed within 48 hours.
</Alert>
```

**Props:**
- `variant`: 'success' | 'error' | 'warning' | 'info'
- `title`: string (optional)
- `icon`: LucideIcon (optional, defaults to variant icon)

### EmptyState

```tsx
import { EmptyState } from '@/components/cbaf';
import { Video } from 'lucide-react';

<EmptyState
  icon={Video}
  title="No videos yet"
  description="Start building your portfolio by submitting your first Proof of Work video"
  action={{
    label: 'Submit Your First Video',
    onClick: () => router.push('/cbaf/videos/submit'),
    icon: Video,
  }}
/>
```

**Props:**
- `icon`: LucideIcon (required)
- `title`: string
- `description`: string
- `action`: { label: string, onClick: () => void, icon?: LucideIcon } (optional)

### Layout Components

#### PageWrapper

```tsx
import { PageWrapper } from '@/components/cbaf';

<PageWrapper>
  {/* Your page content */}
</PageWrapper>
```

#### Header

```tsx
import { Header } from '@/components/cbaf';
import { Video } from 'lucide-react';

<Header
  title="Submit Video"
  subtitle="Submit your Proof of Work video"
  icon={Video}
  variant="black"
  backLink={{ href: '/cbaf/dashboard', label: 'Back to Dashboard' }}
  actions={
    <>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Submit</Button>
    </>
  }
/>
```

**Props:**
- `title`: string
- `subtitle`: string (optional)
- `icon`: LucideIcon (optional)
- `variant`: 'black' | 'white'
- `backLink`: { href: string, label: string } (optional)
- `actions`: ReactNode (optional)

#### Container

```tsx
import { Container } from '@/components/cbaf';

<Container maxWidth="2xl">
  {/* Centered content with max-width */}
</Container>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'

### Shared Components

#### StatCard

```tsx
import { StatCard } from '@/components/cbaf';
import { Video } from 'lucide-react';

<StatCard
  title="Total Videos"
  value={24}
  icon={Video}
  trend={{
    value: '+12%',
    direction: 'up',
    label: 'vs last month',
  }}
/>
```

**Props:**
- `title`: string
- `value`: string | number
- `icon`: LucideIcon
- `trend`: { value: string, direction: 'up' | 'down', label: string } (optional)
- `iconBgColor`: string (default: 'bg-bitcoin-100')
- `iconColor`: string (default: 'text-bitcoin-600')

#### Loading States

```tsx
import { LoadingSpinner, SkeletonCard, SkeletonText } from '@/components/cbaf';

<LoadingSpinner size="md" />

<SkeletonCard />

<SkeletonText lines={3} />
```

## 🎨 Tailwind Utility Classes

### Button Classes
- `.btn-primary` - Bitcoin orange CTA
- `.btn-secondary` - White with border
- `.btn-outline` - Bitcoin orange outline
- `.btn-ghost` - Minimal styling
- `.btn-danger` - Red for destructive actions

### Form Classes
- `.input` - Standard text input
- `.input-error` - Input with error state
- `.select` - Select dropdown
- `.textarea` - Textarea
- `.label` - Form label
- `.helper-text` - Helper text
- `.error-text` - Error text

### Card Classes
- `.card` - Standard card
- `.card-hover` - Card with hover effect
- `.stat-card` - Stat card for dashboards

### Badge Classes
- `.badge-success` - Green badge
- `.badge-warning` - Amber badge
- `.badge-error` - Red badge
- `.badge-info` - Blue badge
- `.badge-bitcoin` - Bitcoin orange badge

### Alert Classes
- `.alert-success` - Green alert
- `.alert-error` - Red alert
- `.alert-warning` - Yellow alert
- `.alert-info` - Blue alert

### Layout Classes
- `.page-wrapper` - Page wrapper with min-height
- `.page-container` - Standard page container
- `.form-container` - Form container (max-w-2xl)
- `.header-black` - Black header
- `.page-header` - Header inner container

## 🚀 Best Practices

1. **Use semantic variants**: Choose button/badge variants that match the action meaning
2. **Provide helpful text**: Use labels, helper text, and error messages
3. **Icons enhance meaning**: Add icons to buttons and badges for clarity
4. **Loading states**: Show loading spinners for async actions
5. **Empty states**: Always provide empty states with clear CTAs
6. **Responsive design**: All components are mobile-first responsive
7. **Accessibility**: Components follow WCAG 2.1 AA guidelines

## 📚 Examples

See the design system documentation at `docs/CBAF_DESIGN_SYSTEM.md` for complete examples and page layouts.

## 🔄 Updates

- **v1.0** (Dec 12, 2025) - Initial component library with light theme design system
