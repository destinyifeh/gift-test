-- Migration: Add claim_token column to flex_cards table
-- This allows using a separate token in URLs instead of exposing the actual card code

-- Add claim_token column (without unique constraint initially)
ALTER TABLE flex_cards ADD COLUMN IF NOT EXISTS claim_token VARCHAR(20);

-- Generate unique claim tokens for existing flex cards that don't have one
-- Using id + random to ensure uniqueness
DO $$
DECLARE
  rec RECORD;
  new_token TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  i INTEGER;
BEGIN
  FOR rec IN SELECT id FROM flex_cards WHERE claim_token IS NULL LOOP
    -- Generate a unique token for each row
    new_token := '';
    FOR i IN 1..16 LOOP
      new_token := new_token || substr(chars, floor(random() * 56 + 1)::int, 1);
    END LOOP;

    UPDATE flex_cards SET claim_token = new_token WHERE id = rec.id;
  END LOOP;
END $$;

-- Now add the unique constraint
ALTER TABLE flex_cards ADD CONSTRAINT flex_cards_claim_token_unique UNIQUE (claim_token);

-- Create index for faster lookups by claim_token
CREATE INDEX IF NOT EXISTS idx_flex_cards_claim_token ON flex_cards(claim_token);

-- Add a comment explaining the column
COMMENT ON COLUMN flex_cards.claim_token IS 'Unique token used in claim URLs instead of exposing the actual card code';
