-- Migration: Add missing columns to campaigns table
-- Applied on 2026-03-22

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS sender_email text,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'NGN';
