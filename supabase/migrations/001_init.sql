-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  display_name text,
  plan text default 'free' check (plan in ('free', 'pro', 'team')),
  api_key text unique default 'nh_' || replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
