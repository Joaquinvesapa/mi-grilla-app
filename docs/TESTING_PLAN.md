# Testing Plan — MiGrilla

> Plan de testing progresivo para MiGrilla.
> Se implementa en fases: primero unit tests, luego integration, luego E2E.

---

## Estado actual

- **Test runner**: Ninguno configurado
- **Cobertura**: 0%
- **Objetivo fase 1**: Configurar Vitest + testear toda la lógica pura del proyecto

---

## Fase 1 — Unit Tests con Vitest

### 1.1 Configuración inicial

- [ ] Instalar dependencias: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`
- [ ] Crear `vitest.config.ts` con alias `@/*` y entorno `jsdom`
- [ ] Crear `vitest.setup.ts` con matchers de `@testing-library/jest-dom`
- [ ] Agregar scripts en `package.json`: `test`, `test:watch`, `test:coverage`
- [ ] Crear carpeta `__tests__/` en la raíz con estructura espejo del proyecto
- [ ] Verificar que `pnpm test` corre sin errores

### 1.2 Tests de lógica pura (Tier 1 — cero dependencias externas)

> Funciones que NO dependen de React, Supabase, DOM ni nada externo.
> Son el punto de entrada PERFECTO para aprender testing.

#### `lib/schedule-utils.ts` — Parsing y cálculos de la grilla

| # | Test | Qué verifica |
|---|------|--------------|
| 1 | `timeToMinutes("14:30")` → `870` | Conversión básica HH:mm a minutos |
| 2 | `timeToMinutes("02:00")` → `1560` (26*60) | Horarios pasada la medianoche suman +24h (lógica festival) |
| 3 | `timeToMinutes("06:00")` → `360` | Las 6AM es el límite, no suma +24h |
| 4 | `timeToMinutes("")` → edge case | String vacío |
| 5 | `minutesToDisplay(870)` → `"14:30"` | Conversión inversa minutos a display |
| 6 | `minutesToDisplay(1560)` → `"02:00"` | Manejo de wrap >24h |
| 7 | `minutesToDisplay(0)` → `"00:00"` | Edge case cero |
| 8 | `getGridBounds(day)` → bounds correctos | Calcula inicio/fin redondeados a 30min para un día |
| 9 | `getGridBounds(emptyDay)` → manejo de día sin artistas | Edge case sin datos |
| 10 | `getTimeMarkers(bounds)` → array de marcadores cada 30min | Genera ticks de tiempo para el eje Y |
| 11 | `minuteToRow(minute, boundsStart)` → row CSS grid | Posicionamiento en la grilla CSS |
| 12 | `parseDay(rawDay)` → GridDay completo | Parseo completo de un día: stages, artistas, bounds |
| 13 | `parseDay` genera IDs únicos por artista | Cada artista tiene un ID determinístico |
| 14 | `parseSchedule(schedule)` → array de GridDay | Parseo del schedule completo |

#### `lib/security.ts` — Validación y sanitización

| # | Test | Qué verifica |
|---|------|--------------|
| 15 | `isValidUuid("550e8400-e29b-41d4-a716-446655440000")` → `true` | UUID v4 válido |
| 16 | `isValidUuid("not-a-uuid")` → `false` | String inválido |
| 17 | `isValidUuid("")` → `false` | String vacío |
| 18 | `validateUuids(["uuid1", "uuid2"])` → array original | Todos válidos, pasa |
| 19 | `validateUuids(["uuid1", "invalid"])` → `[]` | Uno inválido, devuelve vacío |
| 20 | `safeRedirectPath("/grilla")` → `"/grilla"` | Path válido pasa |
| 21 | `safeRedirectPath("//evil.com")` → fallback | Previene open redirect |
| 22 | `safeRedirectPath("https://evil.com")` → fallback | URL absoluta rechazada |
| 23 | `safeRedirectPath(null)` → fallback | Null usa fallback |
| 24 | `escapeIlike("100%")` → `"100\%"` | Escapa wildcard % |
| 25 | `escapeIlike("user_name")` → `"user\_name"` | Escapa wildcard _ |
| 26 | `escapeIlike("test\\path")` → `"test\\\\path"` | Escapa backslash |
| 27 | `isValidStorageUrl(url)` con env mockeado | Valida URL de Supabase Storage |

#### `lib/canvas-utils.ts` — Helpers de canvas (solo los puros)

| # | Test | Qué verifica |
|---|------|--------------|
| 28 | `formatTimeLabel(840)` → `"14 HS"` | Hora exacta (840 = 14*60) |
| 29 | `formatTimeLabel(870)` → `"14:30"` | Media hora |
| 30 | `formatTimeLabel(0)` → `"0 HS"` | Edge case cero |

#### `lib/generate-agenda-image.ts` — Helpers puros de imagen

| # | Test | Qué verifica |
|---|------|--------------|
| 31 | `groupByStartTime(artists)` → agrupación correcta | Agrupa artistas por horario de inicio |
| 32 | `groupByStartTime([])` → `[]` | Array vacío |
| 33 | `calculateContentHeight(groups, cardHeight)` → pixels correctos | Cálculo de altura con gaps |
| 34 | `calculateContentHeight([], cardHeight)` → 0 | Sin grupos |

#### `lib/profile-types.ts` — Avatar

| # | Test | Qué verifica |
|---|------|--------------|
| 35 | `randomAvatar()` devuelve un color del array `AVATAR_COLORS` | Siempre devuelve un color válido |
| 36 | `AVATAR_COLORS` tiene exactamente 5 colores | No se rompe si alguien agrega/quita |

#### `lib/logo-svg.ts` — Logo SVG

| # | Test | Qué verifica |
|---|------|--------------|
| 37 | `createLogoSvg("#fff", "#000")` contiene los fills correctos | SVG generado usa los colores recibidos |
| 38 | `createLogoSvg()` devuelve un string SVG válido | Siempre empieza con `<svg` |

#### `lib/utils.ts` — Utilidad de clases CSS

| # | Test | Qué verifica |
|---|------|--------------|
| 39 | `cn("foo", "bar")` → `"foo bar"` | Merge básico |
| 40 | `cn("p-4", "p-2")` → `"p-2"` | Tailwind merge: último gana |
| 41 | `cn("foo", undefined, "bar")` → `"foo bar"` | Ignora valores falsy |
| 42 | `cn("text-red-500", "text-blue-500")` → `"text-blue-500"` | Conflicto de color, último gana |

### 1.3 Tests de lógica extraíble de componentes (Tier 2)

> Funciones puras que HOY viven dentro de componentes.
> Paso 1: extraerlas a archivos de utilidades. Paso 2: testearlas.

#### Extraer de `agenda-view.tsx` → `lib/agenda-utils.ts`

| # | Test | Qué verifica |
|---|------|--------------|
| 43 | `detectConflicts(artists)` → mapa de IDs con conflictos | Detecta overlaps de horarios (O(n²)) |
| 44 | `detectConflicts` con artistas sin overlap → mapa vacío | No hay conflictos = Set vacío por artista |
| 45 | `detectConflicts` con overlap parcial | Artista A 14:00-15:00 y B 14:30-16:00 → ambos conflictan |
| 46 | `countConflictPairs(artists)` → número de pares | Cuenta pares únicos (no doble-cuenta) |

#### Extraer de `agenda-card.tsx` → `lib/agenda-utils.ts`

| # | Test | Qué verifica |
|---|------|--------------|
| 47 | `formatConflictNames(["A"])` → `"A"` | Un solo nombre |
| 48 | `formatConflictNames(["A", "B"])` → `"A y B"` | Dos nombres |
| 49 | `formatConflictNames(["A", "B", "C"])` → `"A, B y C"` | Tres nombres |
| 50 | `formatConflictNames([])` → `""` | Vacío |

#### Extraer de `compare-view.tsx` → `lib/compare-utils.ts`

| # | Test | Qué verifica |
|---|------|--------------|
| 51 | Categorización Set intersection → `common` | Artistas en ambos sets |
| 52 | Categorización Set difference → `only_me` | Solo en mi set |
| 53 | Categorización Set difference → `only_friend` | Solo en set del amigo |

### 1.4 Tests de validaciones (Tier 3)

> Funciones de validación duplicadas en varios `actions.ts`.
> Paso 1: extraer a `lib/validation.ts`. Paso 2: testear.

#### Extraer a `lib/validation.ts`

| # | Test | Qué verifica |
|---|------|--------------|
| 54 | `validateUsername("migrilla")` → válido | Username normal |
| 55 | `validateUsername("ab")` → error (muy corto, <3 chars) | Mínimo 3 caracteres |
| 56 | `validateUsername("a".repeat(21))` → error (muy largo, >20) | Máximo 20 caracteres |
| 57 | `validateUsername("User Name")` → error | No permite espacios ni mayúsculas |
| 58 | `validateUsername("user@name")` → error | No permite caracteres especiales |
| 59 | `validateUsername("_valid_user_")` → válido | Permite underscores |
| 60 | `validatePin("123456")` → válido | PIN de 6 dígitos |
| 61 | `validatePin("12345")` → error | Menos de 6 dígitos |
| 62 | `validatePin("1234567")` → error | Más de 6 dígitos |
| 63 | `validatePin("abcdef")` → error | Letras no son dígitos |
| 64 | `validatePin("")` → error | Vacío |
| 65 | `validateInstagram("@migrilla")` → `"migrilla"` | Stripea @ |
| 66 | `validateInstagram("migrilla")` → `"migrilla"` | Sin @ también funciona |
| 67 | `validateInstagram("")` → null (opcional) | Vacío es válido (campo opcional) |
| 68 | `validateInstagram("a b c")` → error | Espacios no permitidos |
| 69 | `toFakeEmail("migrilla")` → `"migrilla@migrilla.app"` | Genera email fake correctamente |

---

## Fase 2 — Integration Tests con React Testing Library (futuro)

> Se configurará después de completar Fase 1.
> Testea componentes React renderizados con datos reales/mock.

### Candidatos principales

| Componente | Qué verificar |
|------------|---------------|
| `ArtistCard` | Renderiza nombre, horario, colores según stage. Muestra/oculta info según duración |
| `AgendaCard` | Muestra artista con conflictos, badge social, botón eliminar |
| `PinInput` | Input dígito a dígito, auto-advance, paste, backspace |
| `BottomNav` | Tab activa según ruta, items visibles según props |
| `Avatar` | Imagen vs iniciales según props |
| `ScheduleGrid` | Renderiza grilla con datos de schedule, toggle selección |
| `AgendaView` | Lista correcta por día, indicadores de conflicto |

### Qué mockear

- `createClient()` / `createServerSupabaseClient()` → mock de Supabase
- `usePathname()` / `useRouter()` → mock de Next.js navigation
- Server Actions → mock de funciones async

---

## Fase 3 — E2E Tests con Playwright (futuro)

> Se configurará después de completar Fase 2.
> Testea flujos completos en un browser real.

### Flujos críticos

| Flujo | Pasos |
|-------|-------|
| Login con username+PIN | Navegar a `/login` → ingresar username → ingresar PIN → verificar redirect a `/grilla` |
| Ver grilla | Verificar que la grilla carga con los 3 días, artistas visibles, scroll funcional |
| Armar agenda | Seleccionar artistas en la grilla → ir a `/agenda` → verificar que aparecen |
| Compartir agenda | Generar imagen → verificar descarga/share |
| Flujo social | Buscar amigo → enviar solicitud → aceptar → ver agenda comparada |
| Admin panel | Login como admin → editar horario → verificar cambio en grilla |

### Requisitos de infra

- Supabase local con `npx supabase start`
- Seed de datos de test (schedule + usuarios + friendships)
- Variables de entorno de test separadas (`.env.test`)

---

## Estructura de archivos

```
__tests__/
  lib/
    schedule-utils.test.ts      ← Fase 1.2
    security.test.ts             ← Fase 1.2
    canvas-utils.test.ts         ← Fase 1.2
    generate-agenda-image.test.ts ← Fase 1.2
    profile-types.test.ts        ← Fase 1.2
    logo-svg.test.ts             ← Fase 1.2
    utils.test.ts                ← Fase 1.2
    agenda-utils.test.ts         ← Fase 1.3 (funciones extraídas)
    compare-utils.test.ts        ← Fase 1.3 (funciones extraídas)
    validation.test.ts           ← Fase 1.4 (funciones extraídas)
  components/                    ← Fase 2
    artist-card.test.tsx
    agenda-card.test.tsx
    pin-input.test.tsx
    bottom-nav.test.tsx
    avatar.test.tsx
  app/                           ← Fase 2
    grilla/
      schedule-grid.test.tsx
    agenda/
      agenda-view.test.tsx
  e2e/                           ← Fase 3
    login.spec.ts
    grilla.spec.ts
    agenda.spec.ts
    social.spec.ts
    admin.spec.ts
vitest.config.ts
vitest.setup.ts
playwright.config.ts             ← Fase 3
```

---

## Configuración Vitest (Fase 1)

### Dependencias a instalar

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

### `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      exclude: ["**/*.d.ts", "**/*.test.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

### `vitest.setup.ts`

```ts
import "@testing-library/jest-dom/vitest"
```

### Scripts en `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Métricas objetivo

| Fase | Cobertura objetivo | Tests estimados |
|------|-------------------|-----------------|
| Fase 1.2 | Lógica pura: ~90% | ~42 tests |
| Fase 1.3 | Lógica extraída: ~90% | ~11 tests |
| Fase 1.4 | Validaciones: ~95% | ~16 tests |
| **Total Fase 1** | **~69 tests** | — |
| Fase 2 | Componentes clave: ~70% | ~30-40 tests |
| Fase 3 | Flujos críticos: 6 specs | ~15-20 tests |

---

## Progreso

- [x] **Fase 1.1** — Configuración de Vitest ✅
- [x] **Fase 1.2** — Tests de lógica pura (7 archivos, 72 tests) ✅
- [x] **Fase 1.3** — Extraer y testear lógica de componentes (20 tests) ✅
- [x] **Fase 1.4** — Extraer y testear validaciones (27 tests) ✅
- [ ] **Fase 2** — Integration tests con RTL
- [ ] **Fase 3** — E2E tests con Playwright

**Total Fase 1: 119 tests, 10 archivos, ~900ms**
