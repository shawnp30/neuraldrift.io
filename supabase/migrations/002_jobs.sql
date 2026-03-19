create table jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('training', 'inference', 'captioning', 'export')),
  status text default 'queued' check (status in ('queued', 'running', 'complete', 'error')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  gpu text,
  metadata jsonb default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table jobs enable row level security;
create policy "Users can CRUD their own jobs" on jobs using (auth.uid() = user_id);
