# Afribitools - First Time Setup Script
# This script automates the initial setup process

Write-Host "🚀 Welcome to Afribitools Setup!" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNumber -lt 18) {
    Write-Host "❌ Node.js version $nodeVersion is too old!" -ForegroundColor Red
    Write-Host "Please upgrade to Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path .env) {
    Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -eq 'y' -or $overwrite -eq 'Y') {
        Copy-Item .env.example .env -Force
        Write-Host "✅ .env file created from template" -ForegroundColor Green
    } else {
        Write-Host "📝 Keeping existing .env file" -ForegroundColor Blue
    }
} else {
    Copy-Item .env.example .env
    Write-Host "✅ .env file created from template" -ForegroundColor Green
}
Write-Host ""

# Prompt for DATABASE_URL
Write-Host "🔑 Database Configuration" -ForegroundColor Cyan
Write-Host "Please set up your Neon database:" -ForegroundColor White
Write-Host "1. Visit https://neon.tech and create a free account" -ForegroundColor White
Write-Host "2. Create a new project" -ForegroundColor White
Write-Host "3. Copy the connection string" -ForegroundColor White
Write-Host ""

$databaseUrl = Read-Host "Enter your DATABASE_URL (or press Enter to skip for now)"
if ($databaseUrl) {
    (Get-Content .env) -replace '^DATABASE_URL=.*', "DATABASE_URL=$databaseUrl" | Set-Content .env
    Write-Host "✅ DATABASE_URL configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  DATABASE_URL not configured - you'll need to edit .env manually" -ForegroundColor Yellow
}
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies (this may take 2-3 minutes)..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Database setup
if ($databaseUrl) {
    Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan

    Write-Host "Generating migrations..." -ForegroundColor White
    npm run db:generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Failed to generate migrations" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Migrations generated" -ForegroundColor Green
    }

    Write-Host "Running migrations..." -ForegroundColor White
    npm run db:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Failed to run migrations" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Database initialized" -ForegroundColor Green
    }
    Write-Host ""
} else {
    Write-Host "⏭️  Skipping database setup (DATABASE_URL not configured)" -ForegroundColor Yellow
    Write-Host ""
}

# Success message
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. If you skipped database setup, edit .env and add your DATABASE_URL" -ForegroundColor White
Write-Host "2. Run 'npm run db:generate' and 'npm run db:migrate' to set up the database" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "4. Visit http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "- Setup Guide: SETUP.md" -ForegroundColor White
Write-Host "- Testing: TESTING.md" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Would you like to start the development server now? (y/N)"
if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Happy building! ⚡🚀" -ForegroundColor Cyan
}
