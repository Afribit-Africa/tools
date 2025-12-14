-- Migration: Add Payment Address Fields to Merchants Table
-- Created: 2025-12-12
-- Description: Adds lightning address, payment provider, and verification fields for merchant-level payment tracking

-- Add payment address columns
ALTER TABLE merchants ADD COLUMN lightning_address VARCHAR(255);
ALTER TABLE merchants ADD COLUMN payment_provider VARCHAR(50) DEFAULT 'blink';
ALTER TABLE merchants ADD COLUMN address_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE merchants ADD COLUMN address_verification_error TEXT;
ALTER TABLE merchants ADD COLUMN address_verified_at TIMESTAMPTZ;
ALTER TABLE merchants ADD COLUMN address_verified_by UUID REFERENCES admin_users(id);

-- Add indexes for performance
CREATE INDEX merchant_address_verified_idx ON merchants(address_verified);
CREATE INDEX merchant_payment_provider_idx ON merchants(payment_provider);

-- Add constraint to ensure provider is one of allowed values
ALTER TABLE merchants ADD CONSTRAINT payment_provider_check
  CHECK (payment_provider IN ('blink', 'fedi', 'machankura', 'other'));

-- Add comments for documentation
COMMENT ON COLUMN merchants.lightning_address IS 'Lightning address for payments (e.g., john_doe for Blink, +27xxx for Machankura)';
COMMENT ON COLUMN merchants.payment_provider IS 'Payment provider: blink, fedi, machankura, or other';
COMMENT ON COLUMN merchants.address_verified IS 'Whether the lightning address has been validated by admin';
COMMENT ON COLUMN merchants.address_verification_error IS 'Error message from validation attempt (if failed)';
COMMENT ON COLUMN merchants.address_verified_at IS 'Timestamp when address was verified';
COMMENT ON COLUMN merchants.address_verified_by IS 'Admin user who verified the address';
