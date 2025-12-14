/**
 * Environment Variables Validation
 * 
 * This file validates that all required environment variables are set
 * before the application starts. This prevents runtime errors in production.
 */

interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;
  
  // NextAuth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  
  // Admin Configuration
  CBAF_SUPER_ADMIN_EMAILS?: string;
  CBAF_ADMIN_EMAILS?: string;
  
  // Optional
  BLINK_API_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const;

const optionalEnvVars = [
  'CBAF_SUPER_ADMIN_EMAILS',
  'CBAF_ADMIN_EMAILS',
  'BLINK_API_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
] as const;

export function validateEnvironment(): { isValid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  // Check optional but recommended variables
  if (!process.env.CBAF_SUPER_ADMIN_EMAILS && !process.env.CBAF_ADMIN_EMAILS) {
    warnings.push('No admin emails configured. No one will have admin access.');
  }
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    warnings.push('Email configuration incomplete. Email notifications will not work.');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

export function logEnvironmentStatus(): void {
  const { isValid, missing, warnings } = validateEnvironment();
  
  console.log('\n🔍 Environment Variables Check:');
  console.log('================================');
  
  if (isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }
  
  // Log which optional features are enabled
  console.log('\n📋 Optional Features:');
  console.log(`   - Admin Emails: ${process.env.CBAF_ADMIN_EMAILS ? '✅' : '❌'}`);
  console.log(`   - Super Admin Emails: ${process.env.CBAF_SUPER_ADMIN_EMAILS ? '✅' : '❌'}`);
  console.log(`   - Email Notifications: ${process.env.SMTP_HOST ? '✅' : '❌'}`);
  console.log(`   - Blink API: ${process.env.BLINK_API_URL || 'Default (https://api.blink.sv/graphql)'}`);
  
  console.log('================================\n');
  
  if (!isValid) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file or environment configuration.'
    );
  }
}

// Get environment config (with fallbacks)
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    CBAF_SUPER_ADMIN_EMAILS: process.env.CBAF_SUPER_ADMIN_EMAILS,
    CBAF_ADMIN_EMAILS: process.env.CBAF_ADMIN_EMAILS,
    BLINK_API_URL: process.env.BLINK_API_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };
}

// Validate on import in development
if (process.env.NODE_ENV !== 'production') {
  try {
    logEnvironmentStatus();
  } catch (error) {
    console.error('⚠️  Environment validation failed (continuing in dev mode):', error);
  }
}
