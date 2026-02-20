-- ============================================================
-- MiGrilla — Tablas: groups + group_members
-- Ejecutar en Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 0. Funcion auxiliar para generar codigos de invitacion
create or replace function public.generate_invite_code()
returns text
language sql
as $$
  select upper(substr(md5(random()::text), 1, 6));
$$;

-- ============================================================
-- 1. Tabla de grupos
-- ============================================================

create table public.groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null
               constraint group_name_length check (char_length(name) between 2 and 40),
  invite_code  text unique not null default public.generate_invite_code(),
  created_by   uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now()
);

comment on table  public.groups              is 'Grupos para coordinar asistencia al festival';
comment on column public.groups.invite_code  is 'Codigo alfanumerico de 6 chars para unirse al grupo';
comment on column public.groups.created_by   is 'Usuario que creo el grupo (admin)';

-- Indice para buscar grupo por codigo de invitacion
create index groups_invite_code_idx on public.groups (invite_code);

-- 1.1 Row Level Security
alter table public.groups enable row level security;

-- El creador siempre puede ver su grupo (necesario para el .select() post-insert)
create policy "groups_select_creator"
  on public.groups for select
  using (auth.uid() = created_by);

-- Miembros del grupo pueden ver el grupo
create policy "groups_select_member"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = groups.id
        and group_members.user_id = auth.uid()
    )
  );

-- Cualquier autenticado puede crear un grupo
create policy "groups_insert_authenticated"
  on public.groups for insert
  with check (auth.uid() = created_by);

-- Solo el creador puede editar (renombrar)
create policy "groups_update_creator"
  on public.groups for update
  using (auth.uid() = created_by);

-- Solo el creador puede eliminar
create policy "groups_delete_creator"
  on public.groups for delete
  using (auth.uid() = created_by);

-- ============================================================
-- 2. Tabla de miembros del grupo
-- ============================================================

create table public.group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'member'
            constraint member_role check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),

  constraint group_members_unique unique (group_id, user_id)
);

comment on table  public.group_members       is 'Miembros de cada grupo';
comment on column public.group_members.role  is 'admin = creador del grupo, member = miembro regular';

create index group_members_group_idx on public.group_members (group_id);
create index group_members_user_idx  on public.group_members (user_id);

-- 2.1 Row Level Security
alter table public.group_members enable row level security;

-- Miembros del grupo ven a los otros miembros
create policy "group_members_select_same_group"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members my
      where my.group_id = group_members.group_id
        and my.user_id = auth.uid()
    )
  );

-- Cualquier autenticado puede insertarse (via server action con invite_code valido)
create policy "group_members_insert_self"
  on public.group_members for insert
  with check (auth.uid() = user_id);

-- Admin puede remover miembros, o el miembro se remueve a si mismo
create policy "group_members_delete"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.group_members admin_check
      where admin_check.group_id = group_members.group_id
        and admin_check.user_id = auth.uid()
        and admin_check.role = 'admin'
    )
  );

-- ============================================================
-- 3. Attendance: permitir que miembros del mismo grupo vean agendas
-- ============================================================

create policy "attendance_select_group_members"
  on public.attendance for select
  using (
    exists (
      select 1 from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
        and gm2.user_id = attendance.user_id
    )
  );

-- ============================================================
-- 4. Funcion para buscar grupo por codigo (bypassa RLS ya que
--    el usuario aun no es miembro al momento de buscar)
-- ============================================================

create or replace function public.find_group_by_invite_code(code text)
returns table (id uuid, name text, invite_code text, member_count bigint)
language sql
security definer
stable
as $$
  select
    g.id,
    g.name,
    g.invite_code,
    (select count(*) from public.group_members gm where gm.group_id = g.id) as member_count
  from public.groups g
  where g.invite_code = upper(code)
  limit 1;
$$;
