-- Table for vendor products (gifts)
create table if not exists vendor_gifts (
  id serial primary key,
  vendor_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  category text,
  type text default 'digital', -- 'digital' or 'physical'
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Update campaigns to support redemption
alter table campaigns add column if not exists redeemed_at timestamp with time zone;
alter table campaigns add column if not exists redeemed_by_vendor_id uuid references profiles(id);

-- Enable RLS on vendor_gifts
alter table vendor_gifts enable row level security;

-- Policies for vendor_gifts
create policy "Gifts are viewable by everyone" on vendor_gifts
  for select using (true);

create policy "Vendors can manage their own gifts" on vendor_gifts
  for all using (auth.uid() = vendor_id);
