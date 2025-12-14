#!/bin/bash
# CBAF Payment Verification - Database Migration Script
# Run this script to apply all Phase A migrations

set -e  # Exit on error

echo "🚀 CBAF Payment Verification - Migration Setup"
echo "=============================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo "   Please set it in .env.local or export it:"
  echo "   export DATABASE_URL='postgresql://...'"
  exit 1
fi

echo "✅ Database URL found"
echo ""

# Use Drizzle Kit to push schema changes
echo "📦 Pushing schema changes via Drizzle Kit..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All migrations applied successfully!"
  echo ""
  echo "📊 Database Schema Updated:"
  echo "   - merchants table: +6 payment fields"
  echo "   - economies table: +1 contact email field"
  echo "   - video_submissions table: +3 address verification fields"
  echo "   - email_notifications table: CREATED (20+ columns)"
  echo ""
  echo "🎉 Phase A Database Setup: COMPLETE"
  echo ""
  echo "Next Steps:"
  echo "1. Configure Resend API key in .env.local"
  echo "2. Start Phase B: Video Submission Form Enhancement"
  echo ""
else
  echo ""
  echo "❌ Migration failed. Please check the error messages above."
  exit 1
fi
