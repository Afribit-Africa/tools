# Production Troubleshooting Guide

## 🚨 Current Issue: 500 Error on /api/auth/session

This error means NextAuth cannot establish a session. Here's how to fix it:

### Step 1: Verify Environment Variables

Run this command in your production environment:
```bash
npm run check:env
```

Or manually check these critical variables:

```bash
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
echo $DATABASE_URL
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

### Step 2: Fix NEXTAUTH_URL

**CRITICAL**: The `NEXTAUTH_URL` must exactly match your production domain.

✅ **Correct:**
```bash
NEXTAUTH_URL=https://tools.afribit.africa
```

❌ **Wrong:**
```bash
NEXTAUTH_URL=https://tools.afribit.africa/     # No trailing slash!
NEXTAUTH_URL=http://tools.afribit.africa       # Must be https in prod!
NEXTAUTH_URL=localhost:3000                    # Not for production!
```

### Step 3: Verify Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Click "Edit"
4. Under "Authorized redirect URIs", add:
   ```
   https://tools.afribit.africa/api/auth/callback/google
   ```
5. Make sure there's NO trailing slash
6. Click "Save"

### Step 4: Verify Database Connection

Your DATABASE_URL should look like this:
```bash
postgresql://user:password@ep-xxx.neon.tech/database?sslmode=require
```

Test the connection:
```bash
# In your production environment
psql "$DATABASE_URL" -c "SELECT 1"
```

### Step 5: Generate NEXTAUTH_SECRET

If you don't have one:
```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET`.

## 🔍 Debugging Steps

### 1. Check Production Logs

Look for these log messages:
```
✅ All required environment variables are set
🔐 Sign-in attempt: ...
🔑 JWT Callback: ...
📋 Session Callback: ...
```

If you see errors like:
```
❌ Missing required environment variables: ...
❌ Error in JWT callback: ...
❌ Error in session callback: ...
```

This tells you exactly what's wrong.

### 2. Test NextAuth Endpoints

```bash
# Test providers endpoint (should return Google provider info)
curl https://tools.afribit.africa/api/auth/providers

# Test session endpoint (will show the error)
curl https://tools.afribit.africa/api/auth/session
```

### 3. Common Error Messages

#### "DATABASE_URL environment variable is not set"
**Solution:** Set DATABASE_URL in your hosting platform's environment variables.

#### "Invalid CSRF token"
**Solutions:**
- Clear all cookies for your domain
- Verify NEXTAUTH_URL has no trailing slash
- Make sure NEXTAUTH_URL matches your actual domain

#### "OAuthCallback error"
**Solutions:**
- Add the correct redirect URI in Google Cloud Console
- Format: `https://tools.afribit.africa/api/auth/callback/google`
- No trailing slash, must match exactly

#### "Missing required options" or "No secret provided"
**Solution:** Set NEXTAUTH_SECRET environment variable.

## 📋 Quick Fix Checklist

If you're getting 500 errors, go through this checklist:

- [ ] NEXTAUTH_URL is set to `https://tools.afribit.africa` (no trailing slash)
- [ ] NEXTAUTH_SECRET is set (32+ character random string)
- [ ] DATABASE_URL is set and valid
- [ ] GOOGLE_CLIENT_ID is set
- [ ] GOOGLE_CLIENT_SECRET is set
- [ ] Google OAuth redirect URI is configured correctly
- [ ] All environment variables are set in your hosting platform
- [ ] You've redeployed after setting environment variables

## 🛠️ Platform-Specific Instructions

### Vercel

1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable
4. Redeploy from Deployments tab

### Netlify

1. Site settings → Build & deploy → Environment
2. Click "Edit variables"
3. Add each variable
4. Clear cache and redeploy

### Railway

1. Project → Variables
2. Click "+ New Variable"
3. Add each variable
4. Redeploy

### Docker/VPS

Add to `.env` file or pass as environment variables:
```bash
docker run -e NEXTAUTH_URL=https://tools.afribit.africa \
           -e NEXTAUTH_SECRET=your_secret \
           -e DATABASE_URL=your_db_url \
           ...
```

## 🧪 Testing Locally with Production Settings

Test the production configuration locally:

1. Copy your production environment variables to `.env.local`
2. Set `NEXTAUTH_URL=http://localhost:3000`
3. Run `npm run dev`
4. Test the authentication flow

If it works locally but not in production, the issue is with environment variable configuration on your hosting platform.

## 📞 Still Having Issues?

### Check These Common Mistakes

1. **Trailing slashes** - Remove all trailing slashes from URLs
2. **HTTP vs HTTPS** - Production must use HTTPS
3. **Domain mismatch** - NEXTAUTH_URL must match actual domain
4. **Whitespace** - No spaces before/after environment variable values
5. **Quotes** - Don't wrap values in quotes in some platforms

### Get More Information

Enable verbose logging by adding to your environment:
```bash
NEXTAUTH_DEBUG=true
```

This will show more detailed auth logs.

### Contact Support

If you've tried everything and it still doesn't work:

1. Check server logs for the full error message
2. Include your `Error ID` (digest) if shown
3. Confirm all environment variables are set (don't share the actual values)
4. Share the error message from the logs

Email: support@afribit.africa

## ✅ Success Indicators

You know it's working when:
- No errors in browser console
- Can access https://tools.afribit.africa
- "Sign in with Google" button works
- After login, you're redirected to dashboard
- Session persists when refreshing page
- No 500 errors on /api/auth/session

## 🎯 Final Note

The most common issue is **NEXTAUTH_URL** not matching the production domain. Double-check this first!

```bash
# Should output: https://tools.afribit.africa
echo $NEXTAUTH_URL
```

No trailing slash, must be HTTPS, must match your domain exactly.
