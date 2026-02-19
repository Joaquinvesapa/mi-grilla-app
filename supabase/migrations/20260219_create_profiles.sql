-- ============================================================
-- MiGrilla — Tabla: profiles
-- Ejecutar en Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabla de perfiles (vinculada a auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null
              constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  instagram   text,
  is_public   boolean not null default true,
  avatar      text not null,           -- hex color para avatar generado
  created_at  timestamptz not null default now()
);

comment on table  public.profiles            is 'Perfil publico de cada usuario de MiGrilla';
comment on column public.profiles.username   is 'Username unico, 3-20 chars, lowercase alfanumerico + underscores';
comment on column public.profiles.avatar     is 'Color hex para avatar generado (ej. #07b89c)';

-- 2. Row Level Security
alter table public.profiles enable row level security;

-- Cualquiera puede ver perfiles publicos
create policy "profiles_select_public"
  on public.profiles for select
  using (is_public = true);

-- Cada usuario siempre puede ver su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Cada usuario puede crear su propio perfil
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cada usuario puede actualizar su propio perfil
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Funcion publica para verificar disponibilidad de username
--    Se puede llamar sin estar autenticado (necesaria en el registro)
create or replace function public.is_username_available(target_username text)
returns boolean
language sql
security definer
stable
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(target_username)
  );
$$;
