# AGENTS.md — MiGrilla

> Festival schedule PWA: Next.js 16 + React 19 + Supabase + Tailwind CSS 4.
> Users browse an artist grid, build a personal agenda, and coordinate with friends/groups.

## Build & Run Commands

```bash
# Dev server (port 3000)
pnpm dev            # or: npm run dev

# Production build
pnpm build          # or: npm run build

# Start production server
pnpm start          # or: npm run start

# Type-check (no emit)
npx tsc --noEmit
```

### Testing

No test runner is configured yet (no vitest, jest, or playwright).
If adding tests, prefer **Vitest** (already Vite-compatible via Next.js).

### Linting & Formatting

No ESLint or Prettier config exists. The codebase relies on editor-level formatting
(2-space indent, trailing commas via TypeScript defaults). Keep this consistent.

### Supabase

```bash
# Local Supabase dev (requires Docker)
npx supabase start
npx supabase db reset          # apply all migrations fresh

# Create a new migration
npx supabase migration new <name>

# Migrations live in: supabase/migrations/
```

## Project Structure

```
app/
  layout.tsx              # Root layout (fonts, metadata)
  page.tsx                # Landing / redirect page
  globals.css             # Tailwind 4 @theme tokens + dark mode
  login/                  # Auth pages (username+PIN, Google OAuth)
    actions.ts            # Server Actions for auth
    page.tsx              # Client component with step-based flow
  onboarding/             # Profile creation for OAuth users
    actions.ts
    page.tsx
  auth/callback/route.ts  # OAuth callback Route Handler
  (app)/                  # Authenticated route group
    layout.tsx            # BottomNav + DarkModeToggle + ViewTransition
    grilla/               # Schedule grid (main feature)
    agenda/               # Personal agenda
    social/               # Community, friends, groups
    perfil/               # Profile settings
    home/                 # Home (disabled in nav)
components/               # Shared UI components (no shadcn/ui)
lib/
  utils.ts                # cn() helper (clsx + tailwind-merge)
  supabase/               # Supabase client factories
    client.ts             # Browser client (createClient)
    server.ts             # Server client (createServerSupabaseClient)
    admin.ts              # Admin client with service_role (createAdminClient)
  schedule-types.ts       # Raw JSON + processed grid types
  schedule-utils.ts       # Schedule parsing, time math, stage colors
  profile-types.ts        # Profile interface, avatar colors
  friendship-types.ts     # Friendship status/relation enums
  group-types.ts          # Group/member types
  canvas-utils.ts         # Canvas API helpers for image export
  generate-agenda-image.ts
  generate-grilla-image.ts
middleware.ts             # Auth guard + onboarding redirect
```

## Code Style & Conventions

### TypeScript

- **Strict mode** enabled (`"strict": true` in tsconfig)
- Path alias: `@/*` maps to project root (e.g., `@/lib/utils`)
- Use `interface` for object shapes, `type` for unions/intersections
- Use `as const` objects for enum-like values (NOT TypeScript enums):
  ```ts
  const FRIENDSHIP_STATUS = { PENDING: "pending", ACCEPTED: "accepted" } as const;
  type FriendshipStatus = (typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS];
  ```
- Suffix DB row types plainly (`Profile`, `Group`); enriched UI types get descriptive suffixes (`FriendshipWithProfile`, `GroupWithMeta`, `GroupDetail`)
- Server Action return types use `{ success: boolean; error?: string }` or `{ error?: string; fieldErrors?: Partial<Record<string, string>> } | null`

### Imports

- External packages first, then `@/lib/*`, then `@/components/*`, then relative imports
- Use `import type` for type-only imports: `import type { Profile } from "@/lib/profile-types"`
- Server Actions files start with `"use server";` on line 1
- Client Components start with `"use client";` on line 1

### Components

- **No component libraries** (no shadcn/ui, no Material UI, no Radix primitives). All components are custom-built.
- Feature-local components go in `_components/` inside the route folder
- Shared components go in `components/` at root level
- Props use `interface` named `{ComponentName}Props`
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- All interactive elements need `aria-label`, `aria-pressed`, or `aria-current` attributes
- Buttons must have explicit `type="button"` or `type="submit"`
- SVG icons are inline with `aria-hidden="true"` (no icon library)

### Styling (Tailwind CSS 4)

- CSS tokens defined in `app/globals.css` under `@theme { }` blocks
- Dark mode via `.dark` class on `<html>` (NOT `darkMode: "class"` config — Tailwind 4 uses CSS)
- Reference tokens in Tailwind classes directly: `text-foreground`, `bg-primary`, `border-border`
- For dynamic/computed styles, use inline `style={{ }}` with `var(--color-*)` references
- Font system: `font-display` (Anton, headings/titles, UPPERCASE) and `font-sans` (Host Grotesk, body/UI)
- Mobile-first design. Use `touch-manipulation` on interactive elements.
- Transitions: `transition-colors duration-150` is the standard timing

### Data Flow & Server Actions

- Pages are **async Server Components** that fetch data and pass to client children
- Parallel fetching with `Promise.all()` in page components
- Mutations use **Server Actions** (`"use server"`) in colocated `actions.ts` files
- Client components call Server Actions via `useActionState` (form actions) or `useTransition` (imperative)
- Supabase client selection:
  - Browser/Client Component → `createClient()` from `@/lib/supabase/client`
  - Server Component/Action → `createServerSupabaseClient()` from `@/lib/supabase/server`
  - Bypass RLS (admin ops) → `createAdminClient()` from `@/lib/supabase/admin`

### Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` (function name and export)
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` for enum objects, `camelCase` for simple constants
- Server Actions: `camelCase` verbs (`getMyAttendance`, `saveAttendance`, `sendFriendRequest`)
- Helper functions: `camelCase` (`timeToMinutes`, `parseSchedule`, `validateUsername`)
- CSS tokens: `--color-{category}-{variant}` (e.g., `--color-grid-cell`, `--color-day-viernes`)

### Error Handling

- Server Actions return error objects (never throw): `{ success: false, error: "message" }`
- Form validation: client-side first (instant feedback), server-side as safety net
- Supabase errors: check `error` from destructured response, log with `console.error`, return user-friendly message
- Auth guard: middleware redirects unauthenticated users to `/login`, profileless users to `/onboarding`

### Section Comments

Files use decorated section comments for visual separation:
```ts
// ── Types ──────────────────────────────────────────────────
// ── Constants ──────────────────────────────────────────────
// ── Helpers ────────────────────────────────────────────────
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role (server only, bypasses RLS)
NEXT_PUBLIC_SITE_URL=           # App URL for OAuth redirects
```

## Key Patterns to Preserve

1. **No UI libraries** — every component is custom. Don't add shadcn, Radix, or any UI kit.
2. **Tailwind 4 @theme** — colors and fonts are CSS custom properties, not tailwind.config.
3. **`as const` enums** — never use TypeScript `enum`. Always `const OBJ = {} as const`.
4. **Server/Client boundary** — pages are Server Components; interactive parts are Client Components in `_components/`.
5. **Colocated actions** — each route's Server Actions live in its own `actions.ts`.
6. **Spanish UI text** — all user-facing strings are in Rioplatense Spanish.
7. **Accessibility** — aria attributes on all interactive elements, skip-to-content link in root layout.
