# Afribitools

All-in-one solution for Bitcoin circular economy organizations.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)

---

## Overview

Afribitools is a suite of web-based tools designed to streamline operations for Bitcoin circular economy organizations. Built with modern web technologies and Bitcoin-first design principles, it provides essential utilities for managing Lightning address verification, merchant management, and funding allocation.

## Available Modules

### Fastlight

Bulk Blink Lightning Address Validator with batch payment support.

**Features:**
- Upload CSV/XLSX files containing lightning addresses
- Real-time validation via Blink API
- Multiple provider support (Blink, with extensibility for Fedi and custom providers)
- Automatic whitespace cleaning and address correction suggestions
- Live statistics and progress tracking with filtering (Valid/Invalid)
- Export valid addresses, invalid addresses, or full reports
- Batch payment processing for verified addresses

**Use Cases:** Organizations onboarding users, cleaning address databases, validating payment lists before bulk disbursements.

### CBAF Manager

Circular Bitcoin Africa Fund management system for tracking merchant engagement and funding allocation.

**Features:**
- Economy setup and administration with Google OAuth authentication
- Merchant registration and verification
- Video submission tracking for content creators
- Merit-based ranking system with weighted scoring
- Funding calculation and allocation tools
- Batch payment processing with verification
- Admin dashboard with email notifications
- CSV import/export for merchant data

**Use Cases:** Community organizations managing Bitcoin circular economies, tracking merchant participation, and distributing funding based on engagement metrics.

## Technology Stack

### Frontend
| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| UI Components | Lucide React Icons |
| File Parsing | PapaParse (CSV), xlsx (Excel) |

### Backend
| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ |
| API | Next.js Route Handlers (API Routes) |
| Database | Neon PostgreSQL (Serverless) |
| ORM | Drizzle ORM |
| Authentication | NextAuth.js (Google OAuth) |
| Payment API | Blink GraphQL API |
| Email | Nodemailer (SMTP) |

### Infrastructure
| Category | Technology |
|----------|------------|
| Deployment | Vercel |
| Version Control | Git/GitHub |
| Package Manager | npm |

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Neon PostgreSQL account (free tier available)
- Blink API key (for Lightning address verification)
- Google OAuth credentials (for CBAF authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/Afribit-Africa/tools.git
cd tools

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate and run database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

Access the application at http://localhost:3000

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth (for CBAF)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (for CBAF)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Blink API (for Lightning payments)
BLINK_API_KEY=your-blink-api-key
BLINK_WALLET_ID=your-wallet-id

# Email (optional, for admin notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Project Structure

```
afribitools/
├── app/                      # Next.js App Router pages
│   ├── fastlight/           # Fastlight module
│   ├── cbaf/                # CBAF module
│   │   ├── dashboard/       # Main dashboard
│   │   ├── admin/           # Admin pages
│   │   ├── setup/           # Economy setup
│   │   └── merchants/       # Merchant management
│   ├── api/                 # API route handlers
│   └── page.tsx             # Home page
├── components/              # React components
│   └── modules/             # Module-specific components
│       ├── fastlight/       # Fastlight UI components
│       └── cbaf/            # CBAF UI components
├── lib/                     # Core business logic
│   ├── blink/              # Blink API integration
│   ├── db/                 # Database client and schema
│   ├── parsers/            # File parsing utilities
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript type definitions
├── config/                  # Site configuration
├── migrations/              # Database migrations
├── drizzle/                 # Drizzle ORM configuration
├── scripts/                 # Utility scripts
└── public/                  # Static assets
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio for database inspection
```

### Design System

**Color Palette:**
- Bitcoin Orange: #F7931A
- Background: #0A0A0A (Dark theme)
- Success: #00CC66
- Error: #FF4444
- Warning: #FFB020

**Typography:**
- Code/Numbers: JetBrains Mono
- Headings: Space Grotesk
- Body: Inter
- Brand: Audiowide

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

Vercel automatically detects Next.js and handles the build configuration.

### Manual Deployment

```bash
npm run build
npm run start
```

Ensure all environment variables are configured in your production environment.

## API Endpoints

### Fastlight
- `POST /api/fastlight/verify` - Verify a single Lightning address
- `POST /api/fastlight/verify-batch` - Verify multiple addresses

### CBAF
- `POST /api/cbaf/economy/setup` - Create a new economy
- `GET /api/cbaf/merchants/list` - List merchants for an economy
- `POST /api/cbaf/merchants/register` - Register a new merchant
- `POST /api/cbaf/funding/calculate` - Calculate funding allocation
- `POST /api/cbaf/payments/process` - Process batch payments

## Contributing

We welcome contributions from the community. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

- GitHub Issues: [Report a bug or request a feature](https://github.com/Afribit-Africa/tools/issues)
- Email: tools@afribit.africa
- Twitter: [@afribitafrica](https://twitter.com/afribitafrica)

## Acknowledgments

- [Blink](https://blink.sv) for the Lightning wallet API
- [Afribit Africa](https://afribit.africa) for supporting Bitcoin adoption in Africa
- All contributors to this project

---

Built for the Bitcoin circular economy by Afribit Africa.
