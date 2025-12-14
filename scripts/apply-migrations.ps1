# CBAF Payment Verification - Database Migration Script (Windows)
# Run this script to apply all Phase A migrations

Write-Host "🚀 CBAF Payment Verification - Migration Setup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
  Write-Host "❌ ERROR: DATABASE_URL environment variable not set" -ForegroundColor Red
  Write-Host "   Please set it in .env.local or run:" -ForegroundColor Yellow
  Write-Host "   `$env:DATABASE_URL='postgresql://...'" -ForegroundColor Yellow
  exit 1
}

Write-Host "✅ Database URL found" -ForegroundColor Green
Write-Host ""

# Use Drizzle Kit to push schema changes
Write-Host "📦 Pushing schema changes via Drizzle Kit..." -ForegroundColor Cyan
npx drizzle-kit push

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "✅ All migrations applied successfully!" -ForegroundColor Green
  Write-Host ""
  Write-Host "📊 Database Schema Updated:" -ForegroundColor Cyan
  Write-Host "   - merchants table: +6 payment fields"
  Write-Host "   - economies table: +1 contact email field"
  Write-Host "   - video_submissions table: +3 address verification fields"
  Write-Host "   - email_notifications table: CREATED (20+ columns)"
  Write-Host ""
  Write-Host "🎉 Phase A Database Setup: COMPLETE" -ForegroundColor Green
  Write-Host ""
  Write-Host "Next Steps:" -ForegroundColor Yellow
  Write-Host "1. Configure Resend API key in .env.local"
  Write-Host "2. Start Phase B: Video Submission Form Enhancement"
  Write-Host ""
} else {
  Write-Host ""
  Write-Host "❌ Migration failed. Please check the error messages above." -ForegroundColor Red
  exit 1
}
