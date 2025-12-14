-- CBAF Admin Login Debug Script
-- Run this to check and fix admin login issues

-- 1. Check if admin user exists
SELECT
  google_email,
  role,
  is_active,
  can_approve_videos,
  can_reject_videos,
  created_at,
  last_login_at
FROM admin_users
WHERE google_email = 'spiraedmunds@gmail.com';

-- 2. Check all admin users
SELECT google_email, role, is_active FROM admin_users ORDER BY created_at DESC;

-- 3. If admin doesn't exist and you have the Google ID after OAuth attempt:
-- IMPORTANT: Replace 'ACTUAL_GOOGLE_ID' with the real ID from OAuth logs
/*
INSERT INTO admin_users (
  google_id,
  google_email,
  google_name,
  google_avatar,
  role,
  can_approve_videos,
  can_reject_videos,
  can_send_payments,
  can_manage_admins,
  is_active
) VALUES (
  'ACTUAL_GOOGLE_ID',
  'spiraedmunds@gmail.com',
  'Edmund Spira',
  NULL,
  'admin',
  true,
  true,
  false,
  false,
  true
);
*/

-- 4. If user exists but is inactive:
/*
UPDATE admin_users
SET is_active = true
WHERE google_email = 'spiraedmunds@gmail.com';
*/

-- 5. Check environment configuration
-- Make sure .env has:
-- CBAF_ADMIN_EMAILS=spiraedmunds@gmail.com
-- CBAF_SUPER_ADMIN_EMAILS=edmundspira@gmail.com

-- 6. Verify super admin
SELECT google_email, role FROM admin_users WHERE google_email = 'edmundspira@gmail.com';
