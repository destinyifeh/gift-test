-- CAMPAIGN IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Campaign Images" ON storage.objects;
CREATE POLICY "Public Read Campaign Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'campaign-images' );

DROP POLICY IF EXISTS "Authenticated Upload Campaign Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Campaign Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'campaign-images' );

DROP POLICY IF EXISTS "Users Update Own Campaign Images" ON storage.objects;
CREATE POLICY "Users Update Own Campaign Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'campaign-images' AND owner = auth.uid() );

DROP POLICY IF EXISTS "Users Delete Own Campaign Images" ON storage.objects;
CREATE POLICY "Users Delete Own Campaign Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'campaign-images' AND owner = auth.uid() );


-- USER AVATARS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Users Update Own Avatars" ON storage.objects;
CREATE POLICY "Users Update Own Avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() );


-- PRO BANNERS
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Banners" ON storage.objects;
CREATE POLICY "Public Read Banners"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' );

DROP POLICY IF EXISTS "Authenticated Upload Banners" ON storage.objects;
CREATE POLICY "Authenticated Upload Banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'banners' );


-- VENDOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-products', 'vendor-products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Vendor Products" ON storage.objects;
CREATE POLICY "Public Read Vendor Products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vendor-products' );

DROP POLICY IF EXISTS "Authenticated Upload Vendor Products" ON storage.objects;
CREATE POLICY "Authenticated Upload Vendor Products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'vendor-products' );

DROP POLICY IF EXISTS "Users Update Own Vendor Products" ON storage.objects;
CREATE POLICY "Users Update Own Vendor Products"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'vendor-products' AND owner = auth.uid() );

DROP POLICY IF EXISTS "Users Delete Own Vendor Products" ON storage.objects;
CREATE POLICY "Users Delete Own Vendor Products"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'vendor-products' AND owner = auth.uid() );
