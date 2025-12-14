-- Combined Migration Script for CBAF Payment Verification
-- Run this script to apply all Phase A database changes
-- Date: December 12, 2025

BEGIN;

-- Drop conflicting view from fastlight module
DROP VIEW IF EXISTS validation_session_stats CASCADE;

-- ============================================================================
-- Migration 1: Add Payment Fields to Merchants Table
-- ============================================================================

ALTER TABLE merchants ADD COLUMN IF NOT EXISTS lightning_address VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50) DEFAULT 'blink';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verification_error TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verified_at TIMESTAMPTZ;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address_verified_by UUID REFERENCES admin_users(id);

CREATE INDEX IF NOT EXISTS merchant_address_verified_idx ON merchants(address_verified);
CREATE INDEX IF NOT EXISTS merchant_payment_provider_idx ON merchants(payment_provider);

ALTER TABLE merchants DROP CONSTRAINT IF EXISTS payment_provider_check;
ALTER TABLE merchants ADD CONSTRAINT payment_provider_check
  CHECK (payment_provider IN ('blink', 'fedi', 'machankura', 'other'));

COMMENT ON COLUMN merchants.lightning_address IS 'Lightning address for payments';
COMMENT ON COLUMN merchants.payment_provider IS 'Payment provider: blink, fedi, machankura, or other';

-- ============================================================================
-- Migration 2: Add Contact Email to Economies Table
-- ============================================================================

ALTER TABLE economies ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

UPDATE economies
SET contact_email = google_email
WHERE contact_email IS NULL;

CREATE INDEX IF NOT EXISTS economy_contact_email_idx ON economies(contact_email);

COMMENT ON COLUMN economies.contact_email IS 'Email for admin notifications';

-- ============================================================================
-- Migration 3: Add Address Review Fields to Video Submissions
-- ============================================================================

ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS addresses_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS addresses_verified_at TIMESTAMPTZ;
ALTER TABLE video_submissions ADD COLUMN IF NOT EXISTS invalid_addresses_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS video_addresses_verified_idx ON video_submissions(addresses_verified);

COMMENT ON COLUMN video_submissions.addresses_verified IS 'Whether all merchant payment addresses verified';

-- ============================================================================
-- Migration 4: Create Email Notifications Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),

  template_type VARCHAR(50) NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,

  economy_id UUID REFERENCES economies(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_submissions(id) ON DELETE CASCADE,

  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,

  provider_message_id TEXT,

  sent_by UUID REFERENCES admin_users(id),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS email_recipient_idx ON email_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS email_status_idx ON email_notifications(status);
CREATE INDEX IF NOT EXISTS email_template_idx ON email_notifications(template_type);
CREATE INDEX IF NOT EXISTS email_economy_idx ON email_notifications(economy_id);
CREATE INDEX IF NOT EXISTS email_sent_at_idx ON email_notifications(sent_at);

ALTER TABLE email_notifications DROP CONSTRAINT IF EXISTS template_type_check;
ALTER TABLE email_notifications ADD CONSTRAINT template_type_check
  CHECK (template_type IN ('address_correction_request', 'address_verified', 'funding_processed'));

ALTER TABLE email_notifications DROP CONSTRAINT IF EXISTS email_status_check;
ALTER TABLE email_notifications ADD CONSTRAINT email_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'bounced'));

COMMENT ON TABLE email_notifications IS 'Tracks all emails sent by CBAF system';

-- ============================================================================
-- Verify Tables Exist
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration Complete!';
  RAISE NOTICE 'Merchants table: % payment columns added',
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'merchants'
     AND column_name IN ('lightning_address', 'payment_provider', 'address_verified'));
  RAISE NOTICE 'Email notifications table: % columns',
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'email_notifications');
END $$;

COMMIT;

-- ============================================================================
-- Success Message
-- ============================================================================
-- All Phase A migrations applied successfully!
-- Next: Configure SMTP credentials in .env file
