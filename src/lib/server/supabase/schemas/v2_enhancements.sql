-- V2 Enhancement Migration: WhatsApp Delivery, Flex Cards, Promotions
-- Run this migration to add support for new V2 features

-- =====================================================
-- 1. WhatsApp Delivery Fields for Campaigns
-- =====================================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'email'; -- 'email', 'whatsapp'
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS recipient_phone text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS recipient_country_code text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS whatsapp_fee numeric DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sender_name text;

-- =====================================================
-- 2. Vendor Product Enhancements
-- =====================================================
ALTER TABLE vendor_gifts ADD COLUMN IF NOT EXISTS stock_quantity integer;
ALTER TABLE vendor_gifts ADD COLUMN IF NOT EXISTS units_sold integer DEFAULT 0;
-- Array column for multiple images (up to 3)
ALTER TABLE vendor_gifts ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Product images table (for multiple images per product)
CREATE TABLE IF NOT EXISTS vendor_gift_images (
  id serial PRIMARY KEY,
  vendor_gift_id integer REFERENCES vendor_gifts(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on vendor_gift_images
ALTER TABLE vendor_gift_images ENABLE ROW LEVEL SECURITY;

-- Policies for vendor_gift_images
CREATE POLICY "Product images are viewable by everyone" ON vendor_gift_images
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own product images" ON vendor_gift_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendor_gifts vg
      WHERE vg.id = vendor_gift_id AND vg.vendor_id = auth.uid()
    )
  );

-- =====================================================
-- 3. Promotions Table (for vendor product boosts)
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
  id serial PRIMARY KEY,
  vendor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id integer REFERENCES vendor_gifts(id) ON DELETE CASCADE NOT NULL,
  placement text NOT NULL, -- 'featured', 'new_arrivals', 'sponsored'
  duration_days integer NOT NULL,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  amount_paid numeric NOT NULL,
  status text DEFAULT 'pending_approval', -- 'pending_approval', 'active', 'paused', 'completed', 'cancelled', 'rejected'
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  payment_reference text,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Policies for promotions
CREATE POLICY "Promotions are viewable by everyone" ON promotions
  FOR SELECT USING (true);

CREATE POLICY "Vendors can insert their own promotions" ON promotions
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own promotions" ON promotions
  FOR UPDATE USING (auth.uid() = vendor_id);

-- Updated_at trigger for promotions
CREATE TRIGGER set_promotions_updated_at
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 4. Flex Cards Table
-- =====================================================
CREATE TABLE IF NOT EXISTS flex_cards (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL, -- recipient (null until claimed)
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  initial_amount numeric NOT NULL,
  current_balance numeric NOT NULL,
  currency text DEFAULT 'NGN',
  code text UNIQUE NOT NULL,
  status text DEFAULT 'active', -- 'active', 'partially_used', 'redeemed'
  sender_name text,
  recipient_email text,
  recipient_phone text,
  delivery_method text DEFAULT 'email', -- 'email', 'whatsapp'
  message text,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on flex_cards
ALTER TABLE flex_cards ENABLE ROW LEVEL SECURITY;

-- Policies for flex_cards
CREATE POLICY "Flex cards viewable by sender, recipient, or via code" ON flex_cards
  FOR SELECT USING (
    auth.uid() = sender_id
    OR auth.uid() = user_id
    OR auth.uid() IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

CREATE POLICY "Anyone can create flex cards" ON flex_cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Recipients can update their own flex cards" ON flex_cards
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = sender_id);

-- Updated_at trigger for flex_cards
CREATE TRIGGER set_flex_cards_updated_at
BEFORE UPDATE ON flex_cards
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 5. Flex Card Transactions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS flex_card_transactions (
  id serial PRIMARY KEY,
  flex_card_id integer REFERENCES flex_cards(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on flex_card_transactions
ALTER TABLE flex_card_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for flex_card_transactions
CREATE POLICY "Flex card transactions viewable by card owner or vendor" ON flex_card_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flex_cards fc
      WHERE fc.id = flex_card_id
      AND (fc.user_id = auth.uid() OR fc.sender_id = auth.uid())
    )
    OR auth.uid() = vendor_id
    OR auth.uid() IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles))
  );

CREATE POLICY "Vendors can create flex card transactions" ON flex_card_transactions
  FOR INSERT WITH CHECK (
    auth.uid() = vendor_id
    OR auth.uid() IN (SELECT id FROM profiles WHERE 'vendor' = ANY(roles))
  );

-- =====================================================
-- 6. External Promotions Table (admin-managed)
-- =====================================================
CREATE TABLE IF NOT EXISTS external_promotions (
  id serial PRIMARY KEY,
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  image_url text,
  price numeric,
  redirect_url text NOT NULL, -- external link (WhatsApp, website, etc.)
  placement text NOT NULL, -- 'featured', 'new_arrivals', 'sponsored'
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  status text DEFAULT 'active', -- 'active', 'paused', 'completed'
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on external_promotions
ALTER TABLE external_promotions ENABLE ROW LEVEL SECURITY;

-- Policies for external_promotions
CREATE POLICY "External promotions are viewable by everyone" ON external_promotions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage external promotions" ON external_promotions
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE 'admin' = ANY(roles)));

-- Updated_at trigger for external_promotions
CREATE TRIGGER set_external_promotions_updated_at
BEFORE UPDATE ON external_promotions
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 7. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_promotions_vendor_id ON promotions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_placement ON promotions(placement);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);

CREATE INDEX IF NOT EXISTS idx_flex_cards_code ON flex_cards(code);
CREATE INDEX IF NOT EXISTS idx_flex_cards_user_id ON flex_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_flex_cards_sender_id ON flex_cards(sender_id);
CREATE INDEX IF NOT EXISTS idx_flex_cards_status ON flex_cards(status);

CREATE INDEX IF NOT EXISTS idx_flex_card_transactions_flex_card_id ON flex_card_transactions(flex_card_id);
CREATE INDEX IF NOT EXISTS idx_flex_card_transactions_vendor_id ON flex_card_transactions(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_gift_images_vendor_gift_id ON vendor_gift_images(vendor_gift_id);

CREATE INDEX IF NOT EXISTS idx_external_promotions_status ON external_promotions(status);
CREATE INDEX IF NOT EXISTS idx_external_promotions_placement ON external_promotions(placement);

CREATE INDEX IF NOT EXISTS idx_campaigns_delivery_method ON campaigns(delivery_method);
