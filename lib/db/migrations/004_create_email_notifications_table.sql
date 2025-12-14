-- Migration: Create Email Notifications Table
-- Created: 2025-12-12
-- Description: Tracks all emails sent by the CBAF system (address corrections, funding updates)

CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),

  -- Email Details
  template_type VARCHAR(50) NOT NULL,
    -- 'address_correction_request', 'address_verified', 'funding_processed'
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,

  -- Context
  economy_id UUID REFERENCES economies(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_submissions(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending', 'sent', 'failed', 'bounced'
  error_message TEXT,

  -- Provider Details (Resend)
  provider_message_id TEXT,

  -- Metadata
  sent_by UUID REFERENCES admin_users(id),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX email_recipient_idx ON email_notifications(recipient_email);
CREATE INDEX email_status_idx ON email_notifications(status);
CREATE INDEX email_template_idx ON email_notifications(template_type);
CREATE INDEX email_economy_idx ON email_notifications(economy_id);
CREATE INDEX email_sent_at_idx ON email_notifications(sent_at);

-- Constraint for template type
ALTER TABLE email_notifications ADD CONSTRAINT template_type_check
  CHECK (template_type IN ('address_correction_request', 'address_verified', 'funding_processed'));

-- Constraint for status
ALTER TABLE email_notifications ADD CONSTRAINT email_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'bounced'));

-- Comments
COMMENT ON TABLE email_notifications IS 'Tracks all emails sent by CBAF system for address corrections and funding updates';
COMMENT ON COLUMN email_notifications.template_type IS 'Type of email template used';
COMMENT ON COLUMN email_notifications.provider_message_id IS 'Message ID from Resend API for tracking';
COMMENT ON COLUMN email_notifications.opened_at IS 'When recipient opened email (webhook)';
COMMENT ON COLUMN email_notifications.clicked_at IS 'When recipient clicked link in email (webhook)';
