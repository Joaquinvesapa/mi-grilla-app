-- ============================================================
-- MiGrilla — Tabla: attendance
-- Ejecutar en Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabla de asistencia (artistas que el usuario quiere ver)
create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  artist_id   text not null,             -- composite ID del artista (ej: "viernes-flow-stage-olivia-rodrigo")
  created_at  timestamptz not null default now(),

  constraint attendance_unique_user_artist unique (user_id, artist_id)
);

comment on table  public.attendance             is 'Shows marcados como "voy" por cada usuario';
comment on column public.attendance.artist_id   is 'ID compuesto del artista generado por parseSchedule (dia-escenario-nombre)';

-- 2. Índice para queries frecuentes (obtener todos los artistas de un usuario)
create index attendance_user_id_idx on public.attendance (user_id);

-- 3. Row Level Security
alter table public.attendance enable row level security;

-- Cada usuario puede ver sus propias selecciones
create policy "attendance_select_own"
  on public.attendance for select
  using (auth.uid() = user_id);

-- Cada usuario puede insertar sus propias selecciones
create policy "attendance_insert_own"
  on public.attendance for insert
  with check (auth.uid() = user_id);

-- Cada usuario puede eliminar sus propias selecciones
create policy "attendance_delete_own"
  on public.attendance for delete
  using (auth.uid() = user_id);
