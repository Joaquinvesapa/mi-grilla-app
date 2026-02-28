-- ============================================================
-- Schedule table (JSONB) + admin role on profiles
-- Moves the festival schedule from a static JSON file to a
-- Supabase table so it can be edited live from the admin panel.
-- ============================================================

-- ── 1. Admin flag on profiles (must come FIRST — policies reference it) ──

alter table public.profiles
  add column is_admin boolean not null default false;

-- ── 2. Schedule table ──────────────────────────────────────

create table public.schedule (
  id         uuid primary key default gen_random_uuid(),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Only one row should ever exist (the current schedule).
-- This unique constraint on a constant ensures it:
create unique index schedule_singleton on public.schedule ((true));

alter table public.schedule enable row level security;

-- Everyone can read the schedule (needed for the grid)
create policy "schedule_select_all"
  on public.schedule for select
  using (true);

-- Only admins can insert/update
create policy "schedule_insert_admin"
  on public.schedule for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

create policy "schedule_update_admin"
  on public.schedule for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- No delete policy — the schedule row should never be deleted
