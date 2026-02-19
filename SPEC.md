# MiGrilla — Especificaciones del Proyecto

> Documento vivo. Última actualización: Febrero 2026.
> Inspirado en el análisis de [cosquin-rock-app.vercel.app](https://cosquin-rock-app.vercel.app)

---

## 🎯 Idea General

App web tipo PWA para que los asistentes a un recital/festival puedan:

- Ver la grilla de artistas por escenario y horario
- Armar su agenda personal marcando los shows que quieren ver
- Coordinar con amigos qué shows van a ver juntos
- Exportar su agenda como imagen para compartir en redes

La app es **genérica y reutilizable** — se puede configurar para cualquier recital cambiando los datos del evento.

---

## 🛠 Stack Tecnológico

### Frontend + Backend

- **Next.js 15** (App Router)
  - Frontend React con Server Components
  - API Routes integradas (no se necesita backend separado)
  - Server Actions para mutaciones
  - PWA con Service Worker para uso offline

### Base de Datos y Auth

- **Supabase**
  - PostgreSQL como base de datos
  - Supabase Auth para autenticación (reemplaza NextAuth + Prisma)
  - Row Level Security (RLS) para seguridad a nivel de fila
  - Storage para assets del evento (logos, imágenes)
  - Realtime subscriptions (futuro: ver en vivo quién más va a un show)

### Estilos

- **Tailwind CSS 4**

### Animaciones

- **Framer Motion**

### Generación de imagen

- **Canvas API nativa del browser** (sin librerías externas)
  - Resolución 1080px de ancho (apta para Instagram/Stories)
  - Exporta como JPEG calidad 92%
  - En mobile: usa `navigator.share` para compartir nativo
  - En desktop: descarga directa del archivo

---

## 🔐 Autenticación

Sistema híbrido con tres métodos de entrada. El usuario elige cómo quiere registrarse.

### Método A — Username anónimo (friction-free)

- El usuario elige un username único
- No requiere email ni contraseña
- Implementado con `supabase.auth.signInAnonymously()`
- El username se guarda en la tabla `profiles` asociado al `user.id`
- Ideal para usuarios casuales que no quieren crear cuenta completa

### Método B — Email + Password

- Registro e inicio de sesión tradicional
- Implementado con `supabase.auth.signInWithPassword()` y `signUp()`
- El email queda vinculado a su perfil y agenda

### Método C — Google OAuth

- Un click, sin formularios
- Implementado con `supabase.auth.signInWithOAuth({ provider: 'google' })`
- El username se pide después del primer login si no está seteado

### Upgrade de cuenta anónima

- Un usuario que entró con username puede después vincular su Google o email
- Implementado con `supabase.auth.linkIdentity()`
- **Toda su data se preserva** (agenda, grupos, amigos)

---

## 📱 Funcionalidades

### 1. Grilla del evento

- Vista de grilla con columnas por escenario y filas por horario
- Filtros por escenario (Norte, Sur, Electrónica, etc.)
- Filtro por día (si el evento dura más de un día)
- Buscador de artistas
- Zoom in/out de la grilla
- Click en artista → bottom sheet con detalle + botón "Voy"
- Indicador visual de show en curso ("EN VIVO")
- Indicador de shows ya finalizados (tachado/opaco)

### 2. Mi Agenda

- Lista personal de shows marcados como "Voy"
- Organizada por día y horario
- Indicador de conflictos de horario (dos shows al mismo tiempo)
- Botón para quitar un show de la agenda
- Exportar como imagen (Canvas API):
  - Por día
  - Ambos días juntos
- Botón Compartir (genera link público de la agenda)

### 3. Social

#### Amigos

- Agregar amigos por username
- Sistema de solicitudes (enviar / aceptar / rechazar)
- Ver qué shows tienen en común
- Pantalla de comparación de agendas

#### Grupos

- Crear grupos con nombre
- Unirse con código de invitación
- Compartir código por WhatsApp o link
- Ver agenda colectiva del grupo
- Admin puede renombrar y eliminar el grupo
- Admin puede remover miembros

#### Comunidad

- Lista pública de todos los usuarios registrados
- Opción de aparecer o no en la comunidad (toggle de visibilidad)
- Mostrar Instagram vinculado (opcional)
- Agregar amigos desde la comunidad

### 4. Perfil

- Avatar generado con color aleatorio
- Username editable
- Instagram opcional (para que amigos te encuentren)
- Toggle "Aparecer en Comunidad"
- Accesos directos a Mi Agenda y Mis Grupos
- Cerrar sesión

---

## 🗄 Modelo de Datos (preliminar)

```
profiles
  id          uuid (FK → auth.users)
  username    text unique
  instagram   text nullable
  is_public   boolean default true
  avatar      text (color hex)
  created_at  timestamp

events
  id          uuid
  name        text
  dates       text[]
  logo_url    text
  created_at  timestamp

artists
  id          uuid
  event_id    uuid (FK → events)
  name        text
  stage       text
  day         int
  start_time  timestamp
  end_time    timestamp

attendance
  id          uuid
  user_id     uuid (FK → profiles)
  artist_id   uuid (FK → artists)
  attending   boolean
  created_at  timestamp

friendships
  id          uuid
  requester_id uuid (FK → profiles)
  addressee_id uuid (FK → profiles)
  status      enum (pending, accepted, rejected)
  created_at  timestamp

groups
  id           uuid
  name         text
  invite_code  text unique
  created_by   uuid (FK → profiles)
  created_at   timestamp

group_members
  id        uuid
  group_id  uuid (FK → groups)
  user_id   uuid (FK → profiles)
  joined_at timestamp
```

---

## 🎨 Diseño

### Principios

- **Diseño custom**: NO usar componentes prefabricados de ShadCN, Bootstrap ni librerías de UI genéricas
- El diseño será **definido concretamente en una próxima fase** — por ahora solo se especifica la paleta de colores y estructura
- Evitar cualquier look "de-la-caja" que simule otras apps
- **Se crearán componentes custom para MiGrilla** — componentes reutilizables propios de la app que mantengan cohesión visual y funcional a lo largo de toda la interfaz
- Los componentes compartirán el mismo sistema de diseño, paleta de colores y lenguaje visual

### Especificación actual

- Light Mode por defecto (`#fee4c7`)
- Color primario turquesa (`#07b89c`) — se puede cambiar por evento
- Cada escenario tiene su propio color de acento
- Bottom navigation bar (mobile-first)
- Bottom sheets para detalles de artistas y acciones
- Animaciones con Framer Motion (entrada de listas, transiciones)
- **Fuente display** (`--font-display`): **Anton** — headings, nombres de artistas, títulos, ALL CAPS
- **Fuente body** (`--font-sans`): **Host Grotesk** — UI general, horarios, subtítulos, navegación

### Paleta de colores (extraída de Lollapalooza AR 2025)

Todos los tokens están definidos en `app/globals.css` bajo `@theme inline`.
Se usan tanto en la UI de la app como en la generación de imagen (Canvas API).

#### Base
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-background` | `#fee4c7` | Fondo general de la app |
| `--color-foreground` | `#1a1a1a` | Texto principal |
| `--color-primary` | `#07b89c` | Acciones principales, turquesa |
| `--color-primary-foreground` | `#ffffff` | Texto sobre primario |

#### Días del festival
| Token | Valor | Día |
|-------|-------|-----|
| `--color-day-viernes` | `#0cbba5` | Teal vibrante |
| `--color-day-sabado`  | `#ddc98a` | Beige arenoso cálido |
| `--color-day-domingo` | `#e85555` | Coral / rojo cálido |

#### Accentos de identidad visual
| Token | Valor | Descripción |
|-------|-------|-------------|
| `--color-accent-pink`   | `#f02d7d` | Hot pink / magenta |
| `--color-accent-yellow` | `#d4ec2a` | Lime yellow |
| `--color-accent-cyan`   | `#00d0e8` | Cyan brillante |
| `--color-accent-green`  | `#50c82c` | Verde neón |

#### Grilla
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-grid-cell` | `#ffffff` | Fondo de bloque de artista |
| `--color-grid-cell-foreground` | `#000000` | Texto del bloque |
| `--color-grid-header` | `#ffffff` | Fondo del header de escenario |
| `--color-grid-header-foreground` | `#000000` | Texto del header de escenario |

---

## 🚀 Deploy

- **Vercel** para el frontend/backend (Next.js)
- **Supabase** para DB y auth (cloud)
- PWA con Service Worker para uso offline

---

## 📋 Diferencias con la app de referencia (Cosquín Rock)

| Feature           | Cosquín Rock App                             | MiGrilla                                          |
| ----------------- | -------------------------------------------- | ------------------------------------------------- |
| Auth              | Username + PIN custom (NextAuth Credentials) | Híbrido: Anónimo / Email / Google (Supabase Auth) |
| DB                | PostgreSQL + Prisma                          | Supabase (PostgreSQL + RLS nativo)                |
| Multi-evento      | No (hardcodeado)                             | Sí (tabla `events`)                               |
| Upgrade de cuenta | No                                           | Sí (`linkIdentity`)                               |
| Realtime          | No                                           | Futuro (Supabase Realtime)                        |

---

## ✅ TODOs / Próximos pasos

- [ ] Definir el primer evento a cargar
- [ ] Diseñar el modelo de datos completo en Supabase
- [ ] Scaffoldear el proyecto Next.js 15
- [ ] Configurar Supabase Auth con los tres métodos
- [ ] Construir la grilla
- [ ] Construir Mi Agenda + exportación de imagen
- [ ] Construir el módulo Social
