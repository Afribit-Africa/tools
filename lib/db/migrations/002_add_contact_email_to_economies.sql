-- Migration: Add Contact Email to Economies Table
-- Created: 2025-12-12
-- Description: Adds contact email field for sending payment address correction notifications

-- Add contact email column (nullable initially for backfill)
ALTER TABLE economies ADD COLUMN contact_email VARCHAR(255);

-- Backfill with google_email for existing records
UPDATE economies SET contact_email = google_email WHERE contact_email IS NULL;

-- Make required after backfill
ALTER TABLE economies ALTER COLUMN contact_email SET NOT NULL;

-- Add index
CREATE INDEX economy_contact_email_idx ON economies(contact_email);

-- Add comment
COMMENT ON COLUMN economies.contact_email IS 'Email address for admin notifications (address corrections, funding updates)';
