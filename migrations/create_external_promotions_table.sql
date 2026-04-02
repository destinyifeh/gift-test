-- Migration: Create external_promotions table for admin-managed promotional items
-- This allows admins to add items like Gifthance Flex Card to featured sections

CREATE TABLE IF NOT EXISTS external_promotions (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  redirect_url TEXT NOT NULL,
  placement VARCHAR(50) NOT NULL, -- 'featured', 'new_arrivals', 'sponsored'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_external_promotions_status ON external_promotions(status);
CREATE INDEX IF NOT EXISTS idx_external_promotions_placement ON external_promotions(placement);
CREATE INDEX IF NOT EXISTS idx_external_promotions_status_placement ON external_promotions(status, placement);

-- Add RLS policies
ALTER TABLE external_promotions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active promotions
CREATE POLICY "Anyone can view active external promotions"
  ON external_promotions FOR SELECT
  USING (status = 'active');

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage external promotions"
  ON external_promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Add comment
COMMENT ON TABLE external_promotions IS 'Admin-managed promotional items for the gift shop (e.g., Gifthance Flex Card)';
