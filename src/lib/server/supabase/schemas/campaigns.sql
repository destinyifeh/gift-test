-- Table for campaigns
create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category text not null, -- 'Standard', 'Claimable', etc.
  title text not null,
  description text,
  goal_amount numeric,
  min_amount numeric,
  current_amount numeric default 0,
  end_date timestamp with time zone,
  image_url text,
  visibility text default 'public', -- 'public' or 'private'
  contributors_see_each_other boolean default true,
  status text default 'active', -- 'active', 'paused', 'inactive', 'completed', 'cancelled'
  status_reason text, -- Reason for status change
  paused_by text CHECK (paused_by IN ('admin', 'owner')), -- Who paused the campaign
  campaign_short_id text unique, -- Unique short identifier
  campaign_slug text, -- SEO-friendly title slug
  
  -- Claimable specific fields
  claimable_type text, -- 'money' or 'gift-card'
  claimable_gift_id int, 
  claimable_recipient_type text, -- 'self' or 'other'
  recipient_email text,
  sender_email text,
  payment_reference text,
  currency text default 'NGN',
  gift_code text, -- Generated on launch for claimable
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table campaigns enable row level security;

-- Policies
create policy "Campaigns are viewable by everyone if public." on campaigns
  for select using (visibility = 'public' or auth.uid() = user_id);

create policy "Users can insert their own campaigns." on campaigns
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own campaigns." on campaigns
  for update using (auth.uid() = user_id);


-- Function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on campaigns
for each row
execute function handle_updated_at();
