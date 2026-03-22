-- Add slug column to vendor_gifts table
ALTER TABLE public.vendor_gifts 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate missing slugs from name
UPDATE public.vendor_gifts
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Trim trailing/leading dashes
UPDATE public.vendor_gifts
SET slug = REGEXP_REPLACE(slug, '(^-|-$)', '', 'g')
WHERE slug LIKE '-%' OR slug LIKE '%-';

-- Create an index for faster lookups by slug
CREATE INDEX IF NOT EXISTS idx_vendor_gifts_slug ON public.vendor_gifts (slug);
