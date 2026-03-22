-- Add a rating column to the campaigns table (for voucher gifts)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS vendor_rating INTEGER CHECK (vendor_rating >= 1 AND vendor_rating <= 5);

-- Add a rating column to the creator_support table (for direct support gifts)
ALTER TABLE creator_support ADD COLUMN IF NOT EXISTS vendor_rating INTEGER CHECK (vendor_rating >= 1 AND vendor_rating <= 5);
