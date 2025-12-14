# 🚨 URGENT: Fix Production Errors - Quick Action Guide

## The Problem
Your production site `https://tools.afribit.africa` is showing 500 errors:
- `/api/auth/session` failing
- `CLIENT_FETCH_ERROR` in console
- Users cannot sign in

## The Root Cause
Missing or incorrect environment variables in production.

## ⚡ IMMEDIATE FIX (5 Minutes)

### Step 1: Set These Environment Variables in Your Hosting Platform

Go to your hosting platform (Vercel/Netlify/Railway/etc) and add these:

```bash
# CRITICAL: Must match your exact production domain
NEXTAUTH_URL=https://tools.afribit.africa

# Generate this: openssl rand -base64 32
NEXTAUTH_SECRET=<paste-the-generated-secret-here>

# Your Neon database connection string
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# From Google Cloud Console
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# At least one admin email
CBAF_SUPER_ADMIN_EMAILS=your-email@gmail.com
```

### Step 2: Fix Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://tools.afribit.africa/api/auth/callback/google
   ```
4. **NO trailing slash!**
5. Click Save

### Step 3: Redeploy

After setting environment variables, redeploy your application.

## ✅ Verify It Works

1. Visit https://tools.afribit.africa
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Should redirect to dashboard

## 🔍 Still Not Working?

### Check Your Environment Variables

Run this in your production terminal/logs:
```bash
npm run check:env
```

Or manually verify:
```bash
echo $NEXTAUTH_URL
# Should output: https://tools.afribit.africa (no trailing slash)

echo $DATABASE_URL
# Should output: postgresql://...
```

### Common Mistakes

1. ❌ `NEXTAUTH_URL=https://tools.afribit.africa/` (trailing slash)
2. ❌ `NEXTAUTH_URL=http://tools.afribit.africa` (http instead of https)
3. ❌ Wrong domain in NEXTAUTH_URL
4. ❌ Missing NEXTAUTH_SECRET
5. ❌ Wrong Google OAuth redirect URI

### Get Detailed Instructions

See these files in your repo:
- `docs/PRODUCTION_DEPLOYMENT.md` - Complete deployment checklist
- `docs/TROUBLESHOOTING_PRODUCTION.md` - Step-by-step troubleshooting

## 📋 Environment Variable Checklist

Copy this checklist to your platform:

```env
✅ NEXTAUTH_URL=https://tools.afribit.africa
✅ NEXTAUTH_SECRET=<32-char-random-string>
✅ DATABASE_URL=postgresql://...?sslmode=require
✅ GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
✅ GOOGLE_CLIENT_SECRET=GOCSPX-xxx
✅ CBAF_SUPER_ADMIN_EMAILS=admin@example.com
```

## 🎯 What We Fixed

Just pushed to GitHub:
1. ✅ Better error handling in auth callbacks
2. ✅ Graceful fallbacks for database errors
3. ✅ Improved error messages (no 500s)
4. ✅ Environment validation script
5. ✅ Comprehensive documentation

**Your code is now production-ready.** You just need to configure the environment variables!

## 💡 Quick Test

After setting variables and redeploying, test:

```bash
# Should return Google provider info (not error)
curl https://tools.afribit.africa/api/auth/providers

# Should return session data or empty session (not 500)
curl https://tools.afribit.africa/api/auth/session
```

## 📞 Need Help?

1. Check production logs for specific errors
2. Run `npm run check:env` in production
3. Review `docs/TROUBLESHOOTING_PRODUCTION.md`
4. Verify all environment variables are set

The fix is simple - just environment variables! 🚀
