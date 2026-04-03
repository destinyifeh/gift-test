-- Migration: Create featured_items table for admin-managed featured content
-- This is for internal awareness items like Gifthance Flex Card, new features, etc.
-- NOT for external ads or vendor promotions

CREATE TABLE IF NOT EXISTS featured_items (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT,
  cta_text VARCHAR(100) DEFAULT 'Learn More', -- Call to action button text
  cta_url TEXT NOT NULL, -- Where the CTA button links to
  placement VARCHAR(50) NOT NULL, -- 'hero', 'featured', 'new_arrivals', 'landing_featured'
  display_order INTEGER DEFAULT 0, -- For sorting multiple items
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_featured_items_status ON featured_items(status);
CREATE INDEX IF NOT EXISTS idx_featured_items_placement ON featured_items(placement);
CREATE INDEX IF NOT EXISTS idx_featured_items_order ON featured_items(display_order);

-- Add RLS policies
ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read active featured items
CREATE POLICY "Anyone can view active featured items"
  ON featured_items FOR SELECT
  USING (status = 'active');

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage featured items"
  ON featured_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Add comment
COMMENT ON TABLE featured_items IS 'Admin-managed featured content for internal awareness (Flex Card, new features, announcements)';
