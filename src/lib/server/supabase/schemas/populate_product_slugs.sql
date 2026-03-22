-- Populate missing slugs for vendor_gifts if they are null or empty
UPDATE public.vendor_gifts
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Trim trailing/leading dashes from generated slugs
UPDATE public.vendor_gifts
SET slug = REGEXP_REPLACE(slug, '(^-|-$)', '', 'g')
WHERE slug LIKE '-%' OR slug LIKE '%-';

-- Ensure slugs are unique by appending ID if necessary (basic fallback)
-- In a real scenario, you'd want something more robust, but this helps for migration.
UPDATE public.vendor_gifts
SET slug = slug || '-' || id::text
WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY slug ORDER BY id) as rn
    FROM public.vendor_gifts
    WHERE slug IS NOT NULL
  ) t WHERE rn > 1
);
