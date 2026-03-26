-- Migration to add scheduled_for to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone;
