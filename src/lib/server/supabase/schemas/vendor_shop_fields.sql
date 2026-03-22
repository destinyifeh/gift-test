-- Add shop-related fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS shop_description TEXT,
ADD COLUMN IF NOT EXISTS shop_address TEXT,
ADD COLUMN IF NOT EXISTS shop_slug TEXT;

-- Create a unique index for shop_slug to prevent routing conflicts
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_shop_slug ON public.profiles (shop_slug) WHERE shop_slug IS NOT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.profiles.shop_name IS 'The display name of the vendor''s shop';
COMMENT ON COLUMN public.profiles.shop_description IS 'A brief description of the vendor''s shop';
COMMENT ON COLUMN public.profiles.shop_address IS 'The physical or primary contact address for the vendor''s shop';
COMMENT ON COLUMN public.profiles.shop_slug IS 'The unique URL identifier for the vendor''s shop storefront';
