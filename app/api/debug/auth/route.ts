/**
 * Auth Debug Endpoint
 *
 * Helps diagnose NextAuth configuration issues in production
 * Access: https://tools.afribit.africa/api/debug/auth
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {} as Record<string, any>,
  };

  // Check 1: Environment Variables
  checks.checks.envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    CBAF_SUPER_ADMIN_EMAILS: !!process.env.CBAF_SUPER_ADMIN_EMAILS,
    CBAF_ADMIN_EMAILS: !!process.env.CBAF_ADMIN_EMAILS,
    nextAuthUrlValue: process.env.NEXTAUTH_URL || 'NOT_SET',
  };

  // Check 2: NEXTAUTH_URL validation
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  checks.checks.nextAuthUrlValidation = {
    isSet: !!nextAuthUrl,
    hasProtocol: nextAuthUrl?.startsWith('http://') || nextAuthUrl?.startsWith('https://'),
    hasTrailingSlash: nextAuthUrl?.endsWith('/'),
    isHttpsInProd: process.env.NODE_ENV === 'production' ? nextAuthUrl?.startsWith('https://') : true,
    value: nextAuthUrl || 'NOT_SET',
  };

  // Check 3: Database Connection
  try {
    if (process.env.DATABASE_URL) {
      // Try a simple query - just check if db is accessible
      const result = await db.query.economies.findFirst({
        columns: { id: true },
      });
      checks.checks.database = {
        status: 'connected',
        message: 'Database connection successful',
        hasData: !!result,
      };
    } else {
      checks.checks.database = {
        status: 'error',
        message: 'DATABASE_URL not set',
      };
    }
  } catch (error) {
    checks.checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check 4: Summary
  const envVarsToCheck = {
    DATABASE_URL: checks.checks.envVars.DATABASE_URL,
    NEXTAUTH_URL: checks.checks.envVars.NEXTAUTH_URL,
    NEXTAUTH_SECRET: checks.checks.envVars.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: checks.checks.envVars.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: checks.checks.envVars.GOOGLE_CLIENT_SECRET,
    CBAF_SUPER_ADMIN_EMAILS: checks.checks.envVars.CBAF_SUPER_ADMIN_EMAILS,
    CBAF_ADMIN_EMAILS: checks.checks.envVars.CBAF_ADMIN_EMAILS,
  };
  const allEnvVarsSet = Object.values(envVarsToCheck).every(v => v === true);
  const nextAuthUrlValid = checks.checks.nextAuthUrlValidation.isSet &&
                           checks.checks.nextAuthUrlValidation.hasProtocol &&
                           !checks.checks.nextAuthUrlValidation.hasTrailingSlash &&
                           checks.checks.nextAuthUrlValidation.isHttpsInProd;
  const databaseOk = checks.checks.database.status === 'connected';

  checks.checks.summary = {
    allEnvVarsSet,
    nextAuthUrlValid,
    databaseOk,
    readyForProduction: allEnvVarsSet && nextAuthUrlValid && databaseOk,
  };

  // Add warnings
  const warnings = [];
  if (!allEnvVarsSet) {
    warnings.push('Some required environment variables are missing');
  }
  if (!nextAuthUrlValid) {
    if (!checks.checks.nextAuthUrlValidation.isSet) {
      warnings.push('NEXTAUTH_URL is not set');
    }
    if (checks.checks.nextAuthUrlValidation.hasTrailingSlash) {
      warnings.push('NEXTAUTH_URL should not have trailing slash');
    }
    if (!checks.checks.nextAuthUrlValidation.isHttpsInProd) {
      warnings.push('NEXTAUTH_URL must use https:// in production');
    }
  }
  if (!databaseOk) {
    warnings.push('Database connection failed: ' + checks.checks.database.message);
  }

  checks.checks.warnings = warnings;

  return NextResponse.json(checks, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
