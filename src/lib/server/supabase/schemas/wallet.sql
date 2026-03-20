-- Table for verified bank accounts
create table if not exists bank_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  bank_name text not null,
  bank_code text not null,
  account_number text not null,
  account_name text not null,
  recipient_code text not null,
  country text not null default 'Nigeria',
  currency text not null default 'NGN',
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Table for tracking wallet inflows and outflows
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount bigint not null, -- Amount in kobo (NGN) or cents (USD)
  type text check (type in ('receipt', 'withdrawal', 'fee')),
  status text check (status in ('pending', 'success', 'failed')),
  reference text unique,
  description text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table bank_accounts enable row level security;
alter table transactions enable row level security;

-- Policies for bank_accounts
create policy "Users can view their own bank accounts." on bank_accounts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bank accounts." on bank_accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bank accounts." on bank_accounts
  for delete using (auth.uid() = user_id);

-- Policies for transactions
create policy "Users can view their own transactions." on transactions
  for select using (auth.uid() = user_id);

-- No public insert/update for transactions (should be server-side only in a real app, but for this demo the action uses Service Role or Auth session)
