-- ============================================================
-- MiGrilla — Tabla: friendships
-- Ejecutar en Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabla de amistades / solicitudes
create table public.friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles(id) on delete cascade,
  addressee_id  uuid not null references public.profiles(id) on delete cascade,
  status        text not null default 'pending'
                constraint friendship_status check (status in ('pending', 'accepted', 'rejected')),
  created_at    timestamptz not null default now(),

  constraint friendships_unique unique (requester_id, addressee_id),
  constraint friendships_not_self check (requester_id <> addressee_id)
);

comment on table  public.friendships              is 'Solicitudes y amistades entre usuarios';
comment on column public.friendships.requester_id  is 'Usuario que envió la solicitud';
comment on column public.friendships.addressee_id  is 'Usuario que recibió la solicitud';
comment on column public.friendships.status        is 'pending = esperando respuesta, accepted = amigos, rejected = rechazada';

-- 2. Índices para queries frecuentes
create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);
create index friendships_status_idx    on public.friendships (status);

-- 3. Row Level Security
alter table public.friendships enable row level security;

-- Cada usuario ve solicitudes donde participa
create policy "friendships_select_own"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Solo puede enviar solicitudes como requester
create policy "friendships_insert_own"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

-- Solo el addressee puede actualizar (aceptar/rechazar)
create policy "friendships_update_addressee"
  on public.friendships for update
  using (auth.uid() = addressee_id);

-- Cualquiera de los dos puede eliminar la amistad
create policy "friendships_delete_own"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ============================================================
-- 4. Attendance: permitir que amigos aceptados vean la agenda
-- ============================================================

create policy "attendance_select_friends"
  on public.attendance for select
  using (
    exists (
      select 1 from public.friendships
      where status = 'accepted'
        and (
          (requester_id = auth.uid() and addressee_id = attendance.user_id) or
          (addressee_id = auth.uid() and requester_id = attendance.user_id)
        )
    )
  );
