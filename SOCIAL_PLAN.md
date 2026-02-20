# MiGrilla — Plan del Módulo Social

> Referencia para futuras sesiones. Creado: Febrero 2026.
> **Estado: Fases 0-4 implementadas.** Pendiente: ejecutar migraciones en Supabase y testear.

---

## Fase 1 — Comunidad (descubrimiento de usuarios)

### Objetivo
Permitir que los usuarios descubran a otros asistentes del festival.

### Nueva ruta
`/comunidad`

### DB
No necesita tablas nuevas — usa `profiles` con `is_public = true`.

### Funcionalidades
- Lista de usuarios públicos (paginada, server-side)
- Buscador por username (debounce, busca en `profiles`)
- Card de usuario: avatar + username + instagram (si tiene)
- Botón "Agregar amigo" en cada card (prepara para Fase 2)

### Navegación
Agregar tab "Social" en el bottom nav que contenga Comunidad + Amigos + Grupos en sub-navegación interna.

### RLS
Ya cubierto: `profiles_select_public` permite ver perfiles con `is_public = true`.

---

## Fase 2 — Amigos

### Objetivo
Sistema de amigos 1:1 con solicitudes y comparación de agendas.

### Nueva migración: `friendships`

```sql
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

create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);
```

### RLS de `friendships`
- SELECT: Cada usuario ve solicitudes donde es `requester_id` o `addressee_id`
- INSERT: Solo puede insertar donde es `requester_id`
- UPDATE: Solo puede actualizar donde es `addressee_id` (aceptar/rechazar)
- DELETE: Cualquiera de los dos puede eliminar la amistad

### Cambio en `attendance` RLS
Agregar policy para que amigos aceptados puedan ver el attendance del otro:
```sql
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
```

### Funcionalidades
- Enviar solicitud de amistad (desde comunidad o por username directo)
- Pantalla de solicitudes pendientes (recibidas + enviadas)
- Aceptar / Rechazar solicitudes
- Lista de amigos aceptados
- **Comparar agendas**: vista lado a lado de shows en común / diferentes
- Eliminar amigo

### Rutas
- `/social/amigos` — Lista de amigos + solicitudes pendientes
- `/social/amigos/[friendId]` — Comparación de agendas

---

## Fase 3 — Grupos

### Objetivo
Crear grupos de amigos para coordinar qué shows van a ver juntos.

### Nuevas migraciones

```sql
-- Tabla de grupos
create table public.groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null constraint group_name_length check (char_length(name) between 2 and 40),
  invite_code  text unique not null,
  created_by   uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- Miembros del grupo
create table public.group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'member'
            constraint member_role check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),

  constraint group_members_unique unique (group_id, user_id)
);

create index group_members_group_idx on public.group_members (group_id);
create index group_members_user_idx on public.group_members (user_id);
```

### RLS de `groups`
- SELECT: Miembros del grupo pueden ver el grupo
- INSERT: Cualquier autenticado puede crear un grupo
- UPDATE: Solo admin puede editar (nombre)
- DELETE: Solo admin puede eliminar

### RLS de `group_members`
- SELECT: Miembros del grupo ven a los otros miembros
- INSERT: Cualquier autenticado puede unirse (con invite_code válido, via server action)
- DELETE: Admin puede remover miembros, o el miembro se remueve a sí mismo

### Cambio en `attendance` RLS
Agregar policy para que miembros del mismo grupo vean attendance entre sí:
```sql
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
```

### Funcionalidades
- Crear grupo (nombre → genera código alfanumérico de 6 chars)
- Unirse con código (input manual o link `/grupo/join?code=ABC123`)
- Compartir código por WhatsApp / copiar link
- Ver miembros del grupo (avatar + username)
- **Agenda colectiva**: todos los shows de los miembros combinados, mostrando quiénes van a cada uno
- Admin: renombrar grupo, eliminar grupo, remover miembros
- Abandonar grupo (como miembro)

### Funciones auxiliares (SQL)
```sql
-- Generar código de invitación único
create or replace function public.generate_invite_code()
returns text language sql as $$
  select upper(substr(md5(random()::text), 1, 6));
$$;
```

### Rutas
- `/social/grupos` — Lista de mis grupos
- `/social/grupos/nuevo` — Crear grupo
- `/social/grupos/[groupId]` — Detalle del grupo + agenda colectiva
- `/social/grupos/join` — Unirse con código

---

## Fase 4 — Vistas Sociales en la Grilla

### Objetivo
Integrar la información social dentro de la grilla y agenda existentes.

### Funcionalidades
- En la **grilla**: cada artist-card muestra badge con cantidad de amigos/grupo que van
  - Ej: "3 amigos van" o mini-avatares apilados
- En la **agenda de un amigo**: ver su selección marcando coincidencias con la tuya
- En la **agenda del grupo**: vista combinada con overlay de quién va a cada show
- **Exportar agenda grupal** como imagen

### Cambios en componentes existentes
- `artist-card.tsx`: Recibir prop opcional de amigos que van
- `agenda-view.tsx`: Modo comparación (mi agenda vs amigo/grupo)
- `generate-agenda-image.ts`: Variante para agenda grupal

---

## Orden de ejecución

```
Fase 0 (perfil real) → Fase 1 (comunidad) → Fase 2 (amigos) → Fase 3 (grupos) → Fase 4 (vistas)
```

Cada fase es **independiente y deployable** — después de cada una hay algo funcional y usable.

---

## Impacto en navegación

Bottom nav actual: Grilla | Agenda | Perfil

Propuesta con social: Grilla | Agenda | Social | Perfil

La tab "Social" contiene sub-navegación interna:
- **Comunidad** (descubrir usuarios)
- **Amigos** (lista + solicitudes)
- **Grupos** (mis grupos)
