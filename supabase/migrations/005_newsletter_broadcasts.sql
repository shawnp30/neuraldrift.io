-- Idempotency ledger for the internal Kit (ConvertKit) broadcast draft
-- publisher. This table is written to ONLY by server-side code using the
-- Supabase service role key (which bypasses RLS). No policies are created
-- for anon/authenticated roles, so public/anon clients have zero access
-- (no select, insert, update, or delete).
create table newsletter_broadcasts (
  id uuid primary key default uuid_generate_v4(),
  issue_key text not null,
  content_hash text not null,
  broadcast_id text,
  status text not null default 'reserved' check (status in ('reserved', 'completed', 'reconciliation_required')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (issue_key, content_hash)
);

-- The unique constraint above is what makes concurrent reservation attempts
-- race-safe: Postgres guarantees only one INSERT for a given
-- (issue_key, content_hash) pair can succeed, and the application treats the
-- resulting unique-violation as "already reserved" rather than retrying the
-- write.
create index newsletter_broadcasts_status_idx on newsletter_broadcasts (status);

alter table newsletter_broadcasts enable row level security;
-- Intentionally no policies: RLS is enabled with no grants, so only the
-- service role (which bypasses RLS entirely) can read or write this table.
-- Never add a permissive policy here.
