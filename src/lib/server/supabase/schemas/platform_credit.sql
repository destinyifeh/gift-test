-- Add platform_balance to profiles
alter table if exists public.profiles
  add column if not exists platform_balance bigint default 0;

-- Update transaction types to support platform credits
-- Since postgres enums in check constraints can require dropping/re-creating,
-- we'll alter the check constraint if we know its name, or drop and recreate.
-- Usually, Supabase adds a generic check constraint like transactions_type_check.

alter table if exists public.transactions drop constraint if exists transactions_type_check;

alter table if exists public.transactions 
add constraint transactions_type_check check (
  type in ('receipt', 'withdrawal', 'fee', 'campaign_contribution', 'creator_support', 'platform_credit_conversion', 'gift_purchase')
);

-- We also make sure the `schema` files like profile.sql and wallet.sql match this state.
