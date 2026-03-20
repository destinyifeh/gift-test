-- Table for tracking campaign contributions and metadata
create table if not exists contributions (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade not null,
  transaction_id uuid references transactions(id) on delete set null,
  amount numeric not null,
  currency text not null default 'NGN',
  donor_name text not null,
  donor_email text,
  message text,
  is_anonymous boolean default false,
  hide_amount boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table contributions enable row level security;

-- Policies
create policy "Contributions are viewable by everyone" on contributions
  for select using (true);

-- System handles inserts, no public insert policy
