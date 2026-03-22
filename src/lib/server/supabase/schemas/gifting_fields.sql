-- Add sender details to campaigns for shop gifting
alter table campaigns add column if not exists sender_name text;
alter table campaigns add column if not exists message text;
