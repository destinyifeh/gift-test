-- Add shop_logo_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shop_logo_url TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.shop_logo_url IS 'The URL of the vendor''s shop logo image';
