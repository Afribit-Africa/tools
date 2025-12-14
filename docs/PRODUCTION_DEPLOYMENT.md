# Production Deployment Checklist for tools.afribit.africa

## ✅ Environment Variables Required

### Critical Variables (Application will not start without these)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# NextAuth (Must match your production domain)
NEXTAUTH_URL=https://tools.afribit.africa
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

### Important Variables (Application will run but features may be limited)
```bash
# Admin Configuration
CBAF_SUPER_ADMIN_EMAILS=admin1@example.com,admin2@example.com
CBAF_ADMIN_EMAILS=user1@example.com,user2@example.com

# Email Notifications (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<16-char-app-password>

# Blink API (Optional - defaults to public endpoint)
BLINK_API_URL=https://api.blink.sv/graphql
```

## 🔧 Pre-Deployment Checks

### 1. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create/Select your project
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Add authorized redirect URIs:
  - `https://tools.afribit.africa/api/auth/callback/google`
- [ ] Copy Client ID and Secret to environment variables

### 2. Database Setup
- [ ] Neon PostgreSQL database created
- [ ] Connection string copied (use pooled connection)
- [ ] Database migrations applied
- [ ] Test connection from local environment

### 3. Environment Configuration
- [ ] All environment variables set in production platform
- [ ] NEXTAUTH_URL set to production domain: `https://tools.afribit.africa`
- [ ] NEXTAUTH_SECRET generated (use: `openssl rand -base64 32`)
- [ ] Admin emails configured
- [ ] No trailing slashes in URLs

### 4. Build Test
```bash
# Run locally to ensure build succeeds
npm run build

# Check for TypeScript errors
npm run lint
```

### 5. Test Authentication Flow
- [ ] Can access login page
- [ ] Google OAuth redirect works
- [ ] After login, redirected to dashboard
- [ ] Session persists on page refresh
- [ ] Logout works correctly

## 🚨 Common Production Issues

### Issue 1: 500 Error on /api/auth/session
**Symptoms:**
- Cannot load session
- Auth errors in console
- "CLIENT_FETCH_ERROR" in browser

**Causes:**
1. NEXTAUTH_URL not set or incorrect
2. DATABASE_URL not set or invalid
3. Google OAuth credentials missing/incorrect
4. NEXTAUTH_SECRET missing

**Solution:**
```bash
# Verify these are set correctly
echo $NEXTAUTH_URL  # Should be https://tools.afribit.africa
echo $DATABASE_URL  # Should start with postgresql://
echo $NEXTAUTH_SECRET  # Should be a long random string
```

### Issue 2: Google OAuth Redirect Error
**Symptoms:**
- "Redirect URI mismatch" error
- Cannot complete login

**Solution:**
- Add `https://tools.afribit.africa/api/auth/callback/google` to Google Cloud Console
- Ensure no trailing slashes
- Match domain exactly

### Issue 3: Database Connection Errors
**Symptoms:**
- "DATABASE_URL not set" error
- Cannot fetch data

**Solution:**
- Use Neon's pooled connection string
- Ensure `?sslmode=require` is appended
- Check Neon project is running

## 📝 Environment Variable Template for Production

Copy this template to your hosting platform (Vercel, Netlify, etc.):

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:your_password@your_host.neon.tech/afribitools?sslmode=require

# NextAuth - CRITICAL: Must match your production domain
NEXTAUTH_URL=https://tools.afribit.africa
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here

# Admin Configuration
CBAF_SUPER_ADMIN_EMAILS=your-admin@gmail.com
CBAF_ADMIN_EMAILS=other-admin@gmail.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password

# Blink (Optional)
BLINK_API_URL=https://api.blink.sv/graphql

# Application
NODE_ENV=production
```

## 🔍 Debugging Commands

### Check environment in production logs:
```bash
# The app will log environment status on startup
# Look for:
# ✅ All required environment variables are set
# ❌ Missing required environment variables: ...
```

### Test database connection:
```bash
# In production console/terminal
node -e "require('@neondatabase/serverless'); console.log('Connection OK')"
```

### Verify NextAuth setup:
```bash
# Check NextAuth discovery endpoint
curl https://tools.afribit.africa/api/auth/providers

# Should return Google provider info
```

## 📋 Post-Deployment Verification

### 1. Homepage
- [ ] https://tools.afribit.africa loads
- [ ] No console errors
- [ ] CSS/styling loads correctly

### 2. Authentication
- [ ] Login page loads: https://tools.afribit.africa/auth/signin
- [ ] "Sign in with Google" button works
- [ ] OAuth flow completes successfully
- [ ] Redirected to dashboard after login

### 3. Session Management
- [ ] Session persists on page refresh
- [ ] User data loads correctly
- [ ] Dashboard shows user info
- [ ] Logout works

### 4. Protected Routes
- [ ] Cannot access /cbaf/* without login
- [ ] Redirects to login when unauthorized
- [ ] Proper role-based access (BCE, Admin, Super Admin)

## 🛠️ Quick Fixes for Common Errors

### If session endpoint returns 500:
1. Check production logs for specific error
2. Verify DATABASE_URL is set
3. Verify NEXTAUTH_URL matches domain exactly
4. Verify NEXTAUTH_SECRET is set
5. Check Google OAuth credentials

### If "Invalid CSRF token":
1. Clear cookies
2. Verify NEXTAUTH_URL has no trailing slash
3. Verify domain matches exactly

### If OAuth redirect fails:
1. Add redirect URI in Google Console
2. Format: `https://tools.afribit.africa/api/auth/callback/google`
3. No trailing slash

## 📞 Support

If issues persist:
1. Check server logs for detailed error messages
2. Verify all environment variables are set
3. Test locally with same environment variables
4. Check Neon database is accessible
5. Verify Google OAuth settings

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Homepage loads without errors
- ✅ Login with Google works
- ✅ Session persists across pages
- ✅ Dashboard loads with user data
- ✅ No 500 errors in console
- ✅ All roles (BCE, Admin, Super Admin) work correctly
