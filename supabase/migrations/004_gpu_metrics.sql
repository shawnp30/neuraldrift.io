create table gpu_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  gpu_name text not null,
  utilization integer,
  vram_used_gb numeric(5,2),
  vram_total_gb numeric(5,2),
  temperature_c integer,
  recorded_at timestamptz default now()
);

alter table gpu_metrics enable row level security;
create policy "Users see their own GPU metrics" on gpu_metrics using (auth.uid() = user_id);

-- Auto-cleanup: keep last 7 days only
create or replace function cleanup_old_gpu_metrics() returns void language sql as $$
  delete from gpu_metrics where recorded_at < now() - interval '7 days';
$$;
