-- CAMPAIGN IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Campaign Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'campaign-images' );

CREATE POLICY "Authenticated Upload Campaign Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'campaign-images' );

CREATE POLICY "Users Update Own Campaign Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'campaign-images' AND owner = auth.uid() );

CREATE POLICY "Users Delete Own Campaign Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'campaign-images' AND owner = auth.uid() );


-- USER AVATARS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Users Update Own Avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND owner = auth.uid() );


-- PRO BANNERS
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Banners"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' );

CREATE POLICY "Authenticated Upload Banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'banners' );
