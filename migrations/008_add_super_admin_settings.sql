-- Migration: Add super_admin_settings table for encrypted configuration storage
-- Created: 2025-12-12

CREATE TABLE IF NOT EXISTS super_admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Setting identification
  key TEXT NOT NULL UNIQUE,

  -- Encrypted value
  encrypted_value TEXT NOT NULL,

  -- Metadata
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Connection status (for API integrations)
  is_connected BOOLEAN DEFAULT false,
  last_tested TIMESTAMP,

  -- Additional data (JSON string for flexible storage)
  metadata TEXT,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS settings_key_idx ON super_admin_settings(key);
CREATE INDEX IF NOT EXISTS settings_active_idx ON super_admin_settings(is_active);

-- Add comment
COMMENT ON TABLE super_admin_settings IS 'Encrypted storage for super admin configuration including API keys and sensitive settings';
