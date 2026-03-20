-- Table for tracking direct gifts to creators (not tied to a specific campaign)
create table if not exists creator_support (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null, -- The creator recipient
  transaction_id uuid references transactions(id) on delete set null,
  amount numeric not null,
  currency text not null default 'NGN',
  donor_name text not null,
  donor_email text,
  message text,
  is_anonymous boolean default false,
  hide_amount boolean default false,
  gift_id integer, -- Optional link to vendor gift
  gift_name text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table creator_support enable row level security;

-- Policies
create policy "Creator support records are viewable by everyone" on creator_support
  for select using (true);

create policy "Anyone can insert creator support records" on creator_support
  for insert with check (true);
