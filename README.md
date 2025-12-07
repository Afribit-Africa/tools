# Afribitools

<div align="center">

![Afribitools Logo](https://img.shields.io/badge/⚡-Afribitools-F7931A?style=for-the-badge)

**All-in-one solution for Bitcoin circular economy organizations**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

Afribitools is a suite of web-based tools designed to streamline operations for Bitcoin circular economy organizations. Built with modern web technologies and Bitcoin-first design principles.

## ⚡ Modules

### Fastlight
**Bulk Blink Lightning Address Validator**

- 📤 Upload CSV/XLSX files with lightning addresses
- 🔍 Real-time validation via Blink API
- 🧹 Automatic whitespace cleaning
- 📊 Live statistics and progress tracking
- 💾 Export valid addresses or full reports

**Perfect for**: Organizations onboarding users, cleaning address databases, validating payment lists

## ✨ Features

- **⚡ Fast**: Validates ~20 addresses/second with intelligent rate limiting
- **🎨 Beautiful**: Dark Bitcoin-themed UI with custom typography
- **📱 Responsive**: Works seamlessly on desktop and mobile
- **🔒 Private**: All validation happens in real-time, no data stored
- **🚀 Modern**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **💾 Persistent**: Optional session tracking with Neon PostgreSQL

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Neon PostgreSQL account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/Afribit-Africa/tools.git
cd tools

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Generate and run database migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

Visit **http://localhost:3000** 🎉

**Need detailed setup instructions?** See [QUICKSTART.md](QUICKSTART.md)

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get up and running in 5 minutes
- [Setup Guide](SETUP.md) - Detailed configuration instructions
- [Testing Guide](TESTING.md) - How to test the application
- [Contributing](CONTRIBUTING.md) - Guidelines for contributors

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 |
| **Database** | Neon PostgreSQL |
| **ORM** | Drizzle ORM |
| **API** | Blink GraphQL API |
| **File Parsing** | PapaParse, xlsx |
| **UI Components** | Radix UI |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

## 📁 Project Structure

```
afribitools/
├── app/                    # Next.js App Router pages
│   ├── fastlight/         # Fastlight module
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── components/            # React components
│   └── modules/           # Module-specific components
├── lib/                   # Core business logic
│   ├── blink/            # Blink API integration
│   ├── db/               # Database client & schema
│   ├── parsers/          # File parsing utilities
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── config/               # Site configuration
└── public/               # Static assets
```

## 🎨 Design System

**Color Palette**
- Bitcoin Orange: `#F7931A`
- Background: `#0A0A0A`
- Success: `#00CC66`
- Error: `#FF4444`
- Warning: `#FFB020`

**Typography**
- Code/Numbers: JetBrains Mono
- Headings: Space Grotesk
- Body: Inter
- Brand: Audiowide

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

### Environment Variables

```env
DATABASE_URL=postgresql://...  # Neon PostgreSQL connection string
```

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Afribit-Africa/tools)

1. Click the deploy button above
2. Connect your GitHub account
3. Add `DATABASE_URL` environment variable
4. Deploy!

Vercel automatically detects Next.js and handles the build.

**Manual Deployment**: See [SETUP.md](SETUP.md#deployment) for detailed instructions.

## 🧪 Testing

```bash
# Run the development server
npm run dev

# Test with sample data
# Upload the file: sample-data/addresses.csv

# Check API endpoint
curl -X POST http://localhost:3000/api/fastlight/verify \
  -H "Content-Type: application/json" \
  -d '{"username":"alice"}'
```

See [TESTING.md](TESTING.md) for comprehensive test scenarios.

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🗺️ Roadmap

### Upcoming Modules

- **📊 Analytics Dashboard** - Track circular economy metrics
- **👥 User Manager** - Bulk user operations
- **💰 Payment Tracker** - Monitor lightning payments
- **📧 Newsletter Tool** - Manage subscriber lists
- **🔗 Link Shortener** - Bitcoin-branded short links

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Blink](https://blink.sv) - For the excellent Lightning wallet API
- [Afribit Africa](https://afribit.africa) - Supporting Bitcoin adoption in Africa
- All [contributors](https://github.com/Afribit-Africa/tools/graphs/contributors)

## 📞 Support

- 📧 Email: tools@afribit.africa
- 🐦 Twitter: [@afribitafrica](https://twitter.com/afribitafrica)
- 💬 GitHub Issues: [Report a bug](https://github.com/Afribit-Africa/tools/issues)

## ⚡ Built by the Bitcoin Community

Made with ⚡ and 🧡 for the Bitcoin circular economy

---

<div align="center">

**[Website](https://afribit.africa)** • **[Documentation](QUICKSTART.md)** • **[Contributing](CONTRIBUTING.md)**

</div>
