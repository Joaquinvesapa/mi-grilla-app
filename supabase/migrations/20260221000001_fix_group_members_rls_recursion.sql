-- ============================================================
-- MiGrilla — Fix: Infinite recursion in group_members RLS
-- 
-- PROBLEMA: Las policies de SELECT y DELETE en group_members
-- hacen subqueries a la misma tabla group_members, lo que
-- dispara la evaluación de RLS recursivamente → infinite loop.
--
-- SOLUCIÓN: Crear funciones SECURITY DEFINER que bypasean RLS
-- para verificar membresía/rol, y usarlas en las policies.
-- ============================================================

-- 1. Función helper: ¿El usuario es miembro de este grupo?
--    SECURITY DEFINER = ejecuta con permisos del owner (bypasa RLS)
create or replace function public.is_group_member(
  _group_id uuid,
  _user_id uuid
)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = _group_id
      and user_id = _user_id
  );
$$;

-- 2. Función helper: ¿El usuario es admin de este grupo?
create or replace function public.is_group_admin(
  _group_id uuid,
  _user_id uuid
)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = _group_id
      and user_id = _user_id
      and role = 'admin'
  );
$$;

-- ============================================================
-- 3. Reemplazar policies de group_members
-- ============================================================

-- 3.1 DROP las policies problemáticas
drop policy if exists "group_members_select_same_group" on public.group_members;
drop policy if exists "group_members_delete" on public.group_members;

-- 3.2 SELECT: Miembros del grupo ven a los otros miembros
--     Ahora usa la función SECURITY DEFINER → sin recursión
create policy "group_members_select_same_group"
  on public.group_members for select
  using (
    public.is_group_member(group_id, auth.uid())
  );

-- 3.3 DELETE: Admin puede remover miembros, o el miembro se remueve a sí mismo
create policy "group_members_delete"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or public.is_group_admin(group_id, auth.uid())
  );

-- ============================================================
-- 4. Fix policy de groups que también lee group_members
-- ============================================================

drop policy if exists "groups_select_member" on public.groups;

create policy "groups_select_member"
  on public.groups for select
  using (
    public.is_group_member(id, auth.uid())
  );

-- ============================================================
-- 5. Fix policy de attendance que hace JOIN con group_members
-- ============================================================

drop policy if exists "attendance_select_group_members" on public.attendance;

create policy "attendance_select_group_members"
  on public.attendance for select
  using (
    exists (
      select 1 from public.group_members gm1
      where gm1.user_id = auth.uid()
        and public.is_group_member(gm1.group_id, attendance.user_id)
    )
  );
