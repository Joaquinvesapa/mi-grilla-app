# PRD: Modo Demo Interactivo — MiGrilla

> **Estado**: Draft
> **Autor**: Joaquín (asistido por AI)
> **Fecha**: Abril 2026

---

## 1. Objetivo

Crear una versión demo interactiva de MiGrilla que funcione **sin backend (Supabase)** y con **datos de ejemplo hardcodeados**, accesible por link desde un portfolio profesional.

El visitante debe poder explorar las funcionalidades principales de la app — grilla, agenda personal, social y perfil — sin necesidad de login ni conexión a ningún servicio externo.

### Audiencia

- Reclutadores, CTOs o leads técnicos revisando un portfolio
- Otros devs curiosos que quieren ver la app en acción
- Cualquier persona que reciba el link

### Criterio de éxito

La demo se siente como la app real. El visitante puede interactuar con todas las features principales en menos de 2 minutos y entiende qué hace MiGrilla sin necesidad de explicaciones.

---

## 2. Decisiones de producto

| Decisión        | Elección                                         | Justificación                                                          |
| --------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| URL             | `/demo/...` (route group dentro de la misma app) | Un solo deploy en Vercel, componentes compartidos, sin duplicar código |
| Autenticación   | Sin login. Usuario demo pre-cargado              | Cero fricción. El visitante entra directo                              |
| Datos           | Lollapalooza Argentina 2025 (JSON existente)     | Ya está en el repo, datos reales que se ven bien                       |
| Persistencia    | React state (client-side only)                   | Se resetea al recargar la página — sin cookies, sin localStorage       |
| Backend         | Ninguno. Sin Supabase, sin API calls             | 100% estático/client-side                                              |
| Exportar imagen | Funcional (Canvas API es client-side)            | Ya funciona sin backend, se reutiliza directo                          |
| PWA features    | Deshabilitadas en demo                           | Sin Service Worker, sin install prompt, sin offline indicator          |

---

## 3. Alcance funcional

### 3.1 Grilla de artistas ✅ COMPLETA

Todo funcional, idéntico a la app real:

- Vista de grilla con columnas por escenario y filas por horario
- Tabs por día (Viernes / Sábado / Domingo)
- Filtros por escenario
- Búsqueda de artistas
- Zoom in/out
- Click en artista → bottom sheet con detalle
- Botón "Voy" → agrega a la agenda (state local)
- Dark mode toggle

**Fuente de datos**: `lollapalooza-schedule.json` importado estáticamente.

> **Nota**: Los indicadores "EN VIVO" y "finalizado" NO aplican (la demo no tiene fecha real del festival). Se omiten o se simulan con un horario fijo.

### 3.2 Mi Agenda ✅ COMPLETA

Todo funcional:

- Lista de shows marcados como "Voy" desde la grilla
- Organizada por día y horario
- Indicador de conflictos de horario
- Quitar shows de la agenda
- **Exportar como imagen** → funcional (Canvas API es 100% client-side)
- Compartir → `navigator.share` o descarga directa

**Estado inicial**: El usuario demo arranca con 5-8 shows pre-seleccionados para que la agenda no esté vacía al entrar.

### 3.3 Social 👁️ VISUAL + INTERACCIÓN LOCAL

La sección social muestra datos de ejemplo y permite interacciones que viven en React state (se resetean al recargar).

#### Comunidad

- Lista de ~10 usuarios fake (el demo user + 6 amigos + 3 desconocidos)
- Cards con avatar, username, Instagram
- Botón "Agregar amigo" → cambia el estado del botón visualmente (no persiste)
- Búsqueda funcional (filtra la lista local)

#### Amigos

- 6 amigos pre-cargados con estado `accepted`
- Ver agenda de un amigo → muestra shows en común y diferencias
- Comparación de agendas funcional (datos locales)
- Solicitudes pendientes: 1-2 solicitudes recibidas para mostrar el flujo aceptar/rechazar

#### Grupos

- 2 grupos pre-cargados:
  - **"Los Pibes del Lolla"** — 4 miembros (demo user es admin)
  - **"After Tyler"** — 3 miembros (demo user es member)
- Ver agenda grupal → muestra qué shows tienen en común
- Código de invitación visible (copiable pero no funcional para unirse)
- NO se puede crear grupos nuevos (simplifica el scope)

### 3.4 Perfil 👁️ VISUAL (read-only)

- Muestra el perfil del usuario demo
- Avatar, username, Instagram
- Toggle "Aparecer en Comunidad" → visual pero no persiste
- Links a "Mi Agenda" y "Mis Grupos" funcionan (navegan)
- "Cerrar sesión" → no aplica (se omite o redirige a landing)

### 3.5 EN VIVO (tiempo fijo simulado) 🔴 COMPLETA

La demo simula que el festival está en curso con un **momento fijo hardcodeado**. El visitante ve el estado EN VIVO sin tener que hacer nada.

#### Cómo se ve

- El FAm "EN VIVO" aparece con el dot pulsante rojltros por día, por escenario, búsqueda, zoom)
- Marcar "Voy" a un showo
- Al tocar, abre el bottom sheet con los stages mostrando "Ahora" y "Sigue"
- En la grilla, los shows en curso se marcan visualmente y los finalizados se ven opacos/tachados

#### Momento simulado

Se elige un horario fijo que maximice lo que se ve: **Viernes ~18:30** (o el momento que tenga shows en curso en la mayor cantidad de escenarios + shows próximos interesantes). Se define como constante en `demo-data.ts`.

#### Arquitectura técnica

La infraestructura actual ya soporta esto out of the box:

- `computeLiveStages(day, currentMin)` es puro cálculo — recibe el minuto y devuelve el estado
- `getCurrentFestivalDay()` y `getCurrentFestivalMinutes()` aceptan `overrideNow?: Date`

Para el demo:

- `DemoProvider` expone una constante `DEMO_TIME` (un `Date` fijo) y el `currentMin` derivado
- Se computan los `liveStages` una sola vez con `computeLiveStages(day, DEMO_CURRENT_MIN)` y se pasan al `LiveNowMenu`
- Los componentes de grilla reciben `currentMin` para marcar shows en curso/finalizados
- Sin controles de tiempo, sin interacción — simplemente se ve como si estuvieras en el festival

### 3.6 Landing / Entry Point 🆕 NUEVO

- Página en `/demo` que sirve de entrada
- Breve copy explicando qué es MiGrilla (2-3 líneas)
- Botón "Explorar demo" que lleva directo a `/demo/grilla`
- Opcionalmente: badges del stack (Next.js, Supabase, Tailwind, etc.)

### 3.7 Fuera de alcance ❌

- Login / registro / onboarding
- Crear grupos nuevos
- Unirse a grupo por código
- Service Worker / PWA install prompt / offline indicator
- Editar perfil
- Notificaciones

---

## 4. Datos de ejemplo

### 4.1 Usuario demo (el visitante)

```
id: "demo-user-001"
username: "joaquin_demo"
instagram: "@joaquinvesapa"
is_public: true
avatar: "#3A86FF" (azul)
```

### 4.2 Amigos (6)

| #   | username   | avatar  | instagram   | agenda overlap con demo user |
| --- | ---------- | ------- | ----------- | ---------------------------- |
| 1   | sofi_music | #FF006E | @sofi.music | Alta (4 shows en común)      |
| 2   | nico_lolla | #8ac926 | @nico.lolla | Media (2 shows)              |
| 3   | cami_fest  | #FB5607 | @cami.fest  | Alta (5 shows)               |
| 4   | mati_rock  | #8338EC | @mati.rock  | Baja (1 show)                |
| 5   | lu_beats   | #3A86FF | @lu.beats   | Media (3 shows)              |
| 6   | tomi_live  | #8ac926 | @tomi.live  | Media (2 shows)              |

### 4.3 Usuarios extra (comunidad, no amigos)

| #   | username   | avatar  | instagram   |
| --- | ---------- | ------- | ----------- |
| 7   | vale_dance | #FB5607 | @vale.dance |
| 8   | fede_bass  | #FF006E | null        |
| 9   | mar_vibes  | #8338EC | @mar.vibes  |

### 4.4 Grupos (2)

**Los Pibes del Lolla** (demo user = admin)

- Miembros: joaquin_demo, sofi_music, nico_lolla, cami_fest
- invite_code: "LOLLA2025"

**After Tyler** (demo user = member)

- Miembros: mati_rock (admin), joaquin_demo, lu_beats
- invite_code: "TYLER25"

### 4.5 Asistencia pre-cargada

El usuario demo arranca con estos shows marcados (distribuidos entre los 3 días para que la agenda se vea completa):

- **Viernes**: Tyler, The Creator; Olivia Rodrigo; DJO
- **Sábado**: Shawn Mendes; Benson Boone; Girl in Red
- **Domingo**: Tool; Justin Timberlake

Cada amigo tiene su propia selección (detallada en la implementación) para que las comparaciones muestren datos interesantes.

---

## 5. Arquitectura técnica

### 5.1 Estructura de rutas

```
app/
  demo/
    layout.tsx              ← Demo layout (BottomNav, DarkModeToggle, sin PWA/auth)
    page.tsx                ← Landing del demo ("Explorar demo")
    grilla/
      page.tsx              ← Client Component, usa DemoProvider
    agenda/
      page.tsx              ← Client Component, usa DemoProvider
    social/
      page.tsx              ← Comunidad (Client Component)
      amigos/
        page.tsx            ← Lista de amigos
        [friendId]/
          page.tsx          ← Comparación de agenda
      grupos/
        page.tsx            ← Lista de grupos
        [groupId]/
          page.tsx          ← Detalle de grupo + agenda grupal
    perfil/
      page.tsx              ← Perfil read-only
```

### 5.2 Data layer

```
lib/
  demo/
    demo-data.ts            ← Todos los datos fake (profiles, friendships, groups, attendance)
    demo-context.tsx         ← DemoProvider (React Context) con state de attendance + social
    demo-types.ts            ← Types específicos del demo si hacen falta (reusa los existentes)
```

**Patrón clave**: `DemoProvider` es un React Context que:

1. Carga los datos estáticos al montar
2. Expone el state de asistencia (qué shows "voy") como `useState`
3. Expone el state social (amigos, solicitudes) como `useState`
4. Expone `DEMO_CURRENT_MIN` (constante) y `liveStages` (pre-computados) para la feature EN VIVO
5. Provee funciones para mutar (toggle attendance, accept/reject friend request)
6. **Se resetea al recargar** (es state de React, no persiste)

### 5.3 Reutilización de componentes

| Componente existente                            | Se reutiliza en demo | Notas                                                 |
| ----------------------------------------------- | -------------------- | ----------------------------------------------------- |
| `grilla/_components/schedule-grid.tsx`          | ✅                   | Recibe data como props, no depende de Supabase        |
| `grilla/_components/artist-card.tsx`            | ✅                   | Idem                                                  |
| `grilla/_components/day-tabs.tsx`               | ✅                   | Idem                                                  |
| `grilla/_components/time-axis.tsx`              | ✅                   | Idem                                                  |
| `agenda/_components/agenda-view.tsx`            | ✅                   | Recibe attendance + schedule como props               |
| `agenda/_components/agenda-card.tsx`            | ✅                   | Idem                                                  |
| `agenda/_components/download-agenda-button.tsx` | ✅                   | Canvas API, 100% client                               |
| `social/_components/user-card.tsx`              | ✅                   | Recibe profile + relation como props                  |
| `social/_components/search-input.tsx`           | ✅                   | Puro UI                                               |
| `social/_components/social-tabs.tsx`            | ✅                   | Puro UI                                               |
| `components/avatar.tsx`                         | ✅                   | Puro UI                                               |
| `components/bottom-nav.tsx`                     | ✅ con adaptación    | Rutas cambian de `/(app)/...` a `/demo/...`           |
| `components/dark-mode-toggle.tsx`               | ✅                   | Puro UI                                               |
| `components/live-now-menu.tsx`                  | ✅ con adaptación    | Recibe `liveStages` pre-computados desde DemoProvider |
| `components/pwa-install-prompt.tsx`             | ❌                   | No aplica en demo                                     |
| `components/offline-indicator.tsx`              | ❌                   | No aplica en demo                                     |
| `components/sw-update-prompt.tsx`               | ❌                   | No aplica en demo                                     |
| `components/community-onboarding-modal.tsx`     | ❌                   | No aplica en demo                                     |

### 5.4 Demo layout vs App layout

El layout de demo (`app/demo/layout.tsx`) es una versión simplificada del app layout:

```tsx
// Lo que INCLUYE:
- DarkModeToggle
- BottomNav (con rutas /demo/*)
- DemoProvider (wrapping children)
- LiveNowMenu (conectado al reloj simulado del DemoProvider)
- DemoTimePicker (control de día + hora simulada)
- Banner "Modo Demo"

// Lo que EXCLUYE:
- Supabase auth check
- CommunityOnboardingModal
- PWAInstallPrompt
- OfflineIndicator
- SWUpdatePrompt
- NavigationProgressBar (opcional, incluir si queda bien)
```

### 5.5 Middleware

El middleware actual redirige a `/login` si no hay sesión. Debe **ignorar rutas `/demo/*`** para que el demo sea accesible sin auth.

---

## 6. Consideraciones de UX

### 6.1 Indicador de modo demo

Un banner sutil y persistente (top o floating) que diga algo como:

> **"Modo Demo"** — Los datos son de ejemplo y se resetean al recargar

Esto evita confusión si alguien llega al demo esperando la app real. El banner no debe molestar ni tapar contenido.

### 6.2 Navegación

- El `BottomNav` del demo usa las mismas 4 tabs pero con rutas `/demo/*`
- El tab "Home" sigue deshabilitado (igual que en la app real)
- Back navigation funciona con el router de Next.js

### 6.3 Estado inicial atractivo

La demo debe verse "llena" desde el primer momento:

- Agenda con 8 shows pre-seleccionados
- 6 amigos aceptados + 2 solicitudes pendientes
- 2 grupos con miembros
- Comunidad con 9 perfiles

El visitante ve valor inmediato sin tener que hacer nada.

---

## 7. Estimación de esfuerzo

### Fase 1 — Fundación (más pesada)

| Tarea                       | Complejidad | Descripción                                                |
| --------------------------- | ----------- | ---------------------------------------------------------- |
| Datos mock (`demo-data.ts`) | Media       | Armar todos los perfiles, attendance, groups, friendships  |
| `DemoProvider` context      | Media-Alta  | State management para attendance + social + reloj simulado |
| Demo layout                 | Baja        | Simplificar el app layout, BottomNav con rutas demo        |
| Middleware exception        | Baja        | Excluir `/demo/*` del auth guard                           |
| Landing `/demo`             | Baja        | Copy + botón "Explorar"                                    |

### Fase 2 — Páginas core + EN VIVO

| Tarea               | Complejidad | Descripción                                                              |
| ------------------- | ----------- | ------------------------------------------------------------------------ |
| `/demo/grilla`      | Media       | Reutilizar componentes de grilla, conectar con DemoProvider              |
| `/demo/agenda`      | Media       | Reutilizar agenda view, conectar con DemoProvider                        |
| Exportar imagen     | Baja        | Ya es client-side, solo asegurar que funcione con datos del context      |
| EN VIVO integración | Baja        | Computar liveStages con el minuto fijo, pasar al LiveNowMenu y la grilla |

### Fase 3 — Social

| Tarea                      | Complejidad | Descripción                                 |
| -------------------------- | ----------- | ------------------------------------------- |
| `/demo/social` (comunidad) | Media       | Lista de usuarios mock, botón agregar amigo |
| `/demo/social/amigos`      | Media       | Lista + comparación de agendas              |
| `/demo/social/grupos`      | Media       | Lista + detalle + agenda grupal             |
| `/demo/perfil`             | Baja        | Read-only, datos del demo user              |

### Fase 4 — Polish

| Tarea              | Complejidad | Descripción                                       |
| ------------------ | ----------- | ------------------------------------------------- |
| Banner "Modo Demo" | Baja        | UI indicator                                      |
| Testing manual     | Media       | Verificar todos los flujos, responsive, dark mode |
| Ajustes de UX      | Baja        | Tweaks según lo que se vea raro                   |

**Estimación total**: ~3-5 días de trabajo (asumiendo dedicación parcial y que los componentes existentes se reutilizan bien).

---

## 8. Riesgos y mitigaciones

| Riesgo                                                                 | Impacto | Mitigación                                                                                 |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| Componentes existentes están muy acoplados a Server Actions / Supabase | Alto    | Auditar cada componente antes de la Fase 2. Si están acoplados, crear wrappers client-side |
| Los datos del JSON no tienen IDs (solo nombres)                        | Medio   | El schedule parser ya genera IDs — verificar que `GridArtist.id` sea estable               |
| El export de imagen referencia data de Supabase                        | Bajo    | Canvas utils usan data pasada como parámetro, no fetch directo                             |
| BottomNav hardcodea rutas `/(app)/...`                                 | Bajo    | Parametrizar las rutas o crear un DemoBottomNav                                            |
| SEO / indexación del demo                                              | Bajo    | Agregar meta robots que permitan indexar la landing pero no las sub-rutas                  |

---

## 9. Fuera de v1 (posibles mejoras futuras)

- **Control de tiempo interactivo**: Slider para que el visitante pueda moverse por el horario del festival y ver cómo cambia el EN VIVO
- **Tour guiado**: Tooltips o pasos que expliquen cada sección
- **Múltiples perfiles demo**: Poder switchear entre usuarios para ver la app desde otra perspectiva
- **Datos de otros festivales**: Poder cambiar el evento de ejemplo
- **Deeplinks a secciones**: `migrilla.app/demo/grilla`, `/demo/agenda`, etc. para linkear desde el portfolio a features específicas (esto ya funciona con la estructura de rutas propuesta)
