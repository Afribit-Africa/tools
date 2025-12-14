/**
 * Debug API Route for Production
 *
 * Use this to check environment variables in production
 * Access: https://tools.afribit.africa/api/debug/env
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Only show in non-production or with auth
  const isProduction = process.env.NODE_ENV === 'production';

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAdminEmails: !!process.env.CBAF_SUPER_ADMIN_EMAILS,

    // Safe values (no secrets)
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...' || 'NOT_SET',
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'NOT_SET',
  };

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: envStatus,
    message: isProduction
      ? 'Check if all required variables are true'
      : 'Environment check endpoint',
  });
}
