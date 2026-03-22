-- Create favorites table
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id bigint references public.vendor_gifts(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  
  -- Prevent duplicate favorites
  unique(user_id, product_id)
);

-- RLS
alter table public.favorites enable row level security;

create policy "Users can view their own favorites." on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can add their own favorites." on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their own favorites." on public.favorites
  for delete using (auth.uid() = user_id);

-- Indexes
create index favorites_user_id_idx on public.favorites(user_id);
create index favorites_product_id_idx on public.favorites(product_id);
