-- Migration: Add Address Review Fields to Video Submissions
-- Created: 2025-12-12
-- Description: Adds payment address verification tracking to video submissions

-- Add address verification status columns
ALTER TABLE video_submissions ADD COLUMN addresses_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE video_submissions ADD COLUMN addresses_verified_at TIMESTAMPTZ;
ALTER TABLE video_submissions ADD COLUMN invalid_addresses_count INTEGER DEFAULT 0;

-- Add index
CREATE INDEX video_addresses_verified_idx ON video_submissions(addresses_verified);

-- Add comments
COMMENT ON COLUMN video_submissions.addresses_verified IS 'Whether all merchant payment addresses have been verified';
COMMENT ON COLUMN video_submissions.addresses_verified_at IS 'Timestamp when all addresses were verified';
COMMENT ON COLUMN video_submissions.invalid_addresses_count IS 'Count of merchants with invalid payment addresses';
