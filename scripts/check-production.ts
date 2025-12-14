/**
 * Production Readiness Check
 * 
 * This script validates the production environment and provides
 * helpful debugging information for deployment issues.
 */

function checkEnvironment() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Production Readiness Check');
  console.log('='.repeat(60) + '\n');

  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  // Critical environment variables
  const critical = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  // Important but not critical
  const important = [
    'CBAF_SUPER_ADMIN_EMAILS',
    'CBAF_ADMIN_EMAILS',
  ];

  // Optional
  const optional = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'BLINK_API_URL',
  ];

  // Check critical variables
  console.log('🔴 Critical Environment Variables:');
  critical.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      errors.push(`${varName} is not set`);
      console.log(`   ❌ ${varName}: NOT SET`);
    } else {
      // Mask sensitive values
      const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD')
        ? '***' + value.slice(-4)
        : value.length > 50
        ? value.slice(0, 30) + '...' + value.slice(-10)
        : value;
      console.log(`   ✅ ${varName}: ${maskedValue}`);
    }
  });

  // Check important variables
  console.log('\n🟡 Important Environment Variables:');
  important.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      warnings.push(`${varName} is not set - some features may not work`);
      console.log(`   ⚠️  ${varName}: NOT SET`);
    } else {
      console.log(`   ✅ ${varName}: ${value.split(',').length} email(s) configured`);
    }
  });

  // Check optional variables
  console.log('\n⚪ Optional Environment Variables:');
  optional.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      const maskedValue = varName.includes('PASS')
        ? '***' + value.slice(-4)
        : value;
      console.log(`   ✅ ${varName}: ${maskedValue}`);
    } else {
      console.log(`   ⚪ ${varName}: Not set (optional)`);
    }
  });

  // Validate NEXTAUTH_URL format
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    if (!nextAuthUrl.startsWith('http://') && !nextAuthUrl.startsWith('https://')) {
      errors.push('NEXTAUTH_URL must start with http:// or https://');
    }
    if (nextAuthUrl.endsWith('/')) {
      warnings.push('NEXTAUTH_URL should not have a trailing slash');
    }
    if (process.env.NODE_ENV === 'production' && !nextAuthUrl.startsWith('https://')) {
      errors.push('NEXTAUTH_URL must use https:// in production');
    }
  }

  // Check NODE_ENV
  console.log('\n📋 Application Info:');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  if (errors.length === 0) {
    console.log('✅ All critical environment variables are set!');
  } else {
    console.log('❌ ERRORS FOUND:');
    errors.forEach((error) => console.log(`   - ${error}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warning) => console.log(`   - ${warning}`));
  }

  console.log('='.repeat(60) + '\n');

  // Return status
  return {
    isReady: errors.length === 0,
    errors,
    warnings,
  };
}

// Run the check
const result = checkEnvironment();

// Only fail the build in production or when NODE_ENV is explicitly set
const shouldFailBuild = process.env.NODE_ENV === 'production' || process.env.CHECK_ENV_STRICT === 'true';

// Exit with error code if critical issues found and we're in strict mode
if (!result.isReady && shouldFailBuild) {
  console.error('\n❌ Production environment is not ready!');
  console.error('Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (!result.isReady) {
  console.warn('\n⚠️  Environment validation failed, but continuing in development mode.');
  console.warn('Set NODE_ENV=production to enforce validation.\n');
} else {
  console.log('✅ Production environment is ready!\n');
}

export default checkEnvironment;
