-- Migration: Add is_anonymous column to campaigns table
-- This allows senders to hide their identity when sending gifts

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN campaigns.is_anonymous IS 'When true, the sender identity is hidden from the recipient';
