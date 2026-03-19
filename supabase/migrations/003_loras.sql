create table loras (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  slug text unique not null,
  name text not null,
  description text,
  base_model text not null,
  rank integer,
  type text check (type in ('character', 'style', 'concept', 'video')),
  download_url text,
  size_bytes bigint,
  public boolean default false,
  created_at timestamptz default now()
);

alter table loras enable row level security;
create policy "Public LoRAs visible to all" on loras for select using (public = true or auth.uid() = user_id);
create policy "Users manage their LoRAs" on loras for all using (auth.uid() = user_id);
