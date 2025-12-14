-- Safe Migration: Add Contact Email to Economies
-- This migration adds the contact_email field safely by making it nullable first

-- Step 1: Add column as nullable
ALTER TABLE economies ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- Step 2: Backfill with google_email for existing records
UPDATE economies
SET contact_email = google_email
WHERE contact_email IS NULL;

-- Step 3: Now make it NOT NULL (safe because all rows have values)
ALTER TABLE economies
ALTER COLUMN contact_email SET NOT NULL;

-- Step 4: Add index
CREATE INDEX IF NOT EXISTS economy_contact_email_idx ON economies(contact_email);

-- Add comment
COMMENT ON COLUMN economies.contact_email IS 'Email address for admin notifications (address corrections, funding updates)';
