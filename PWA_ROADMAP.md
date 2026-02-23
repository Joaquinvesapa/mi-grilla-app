# MiGrilla PWA — Roadmap de Implementación

> Fases implementadas: **Fase 1** (PWA Instalable), **Fase 2** (Offline Shell), **Fase 3** (Offline Datos), **Fase 4** (Premium UX)
> Estado actual: App completa con agenda offline, background sync, SW updates y share target

---

## ✅ Completado

### Fase 1 — PWA Instalable
- [x] Generar íconos PNG (192x192, 512x512, apple-touch-icon 180x180, maskable)
- [x] Crear Web App Manifest via Next.js Metadata Route API (`app/manifest.ts`)
- [x] Meta tags PWA en `layout.tsx` (manifest link, apple-web-app, viewport, theme-color)
- [x] Limpiar `public/` de archivos del starter template
- [x] Actualizar middleware matcher para excluir `/sw.js`, `/manifest.webmanifest`, `/~offline`
- [x] Agregar `worker-src 'self'` al CSP

### Fase 2 — Service Worker + Offline Shell
- [x] Instalar `@serwist/next` + `serwist`
- [x] Configurar `next.config.ts` con `withSerwistInit` (solo en production)
- [x] Crear Service Worker (`app/sw.ts`) con caching strategies:
  - Precaching del app shell (HTML, CSS, JS, fuentes)
  - **CacheFirst** para assets estáticos (fuentes, imágenes)
  - **NetworkFirst** para pages (intenta red primero, cae a cache)
  - **StaleWhileRevalidate** para API calls
- [x] Página `/~offline` como fallback cuando no hay conexión
- [x] Estilos PWA standalone mode (`display-mode: standalone`)
- [x] Banner inteligente de instalación (`PWAInstallPrompt`)
  - Detecta Android/Desktop Chrome → botón "Instalar"
  - Detecta iOS Safari → instrucciones de "Compartir → Agregar a pantalla de inicio"
  - Detecta iOS Brave/Chrome → guía para abrir en Safari
  - Guarda dismissal en localStorage por 7 días
- [x] Fix: Safe area en iOS standalone (notch + home indicator)
  - CSS custom properties: `--safe-area-top`, `--safe-area-bottom`, `--app-viewport-height`
  - Bottom nav con altura dinámica
  - Todas las páginas/loadings respetan safe areas

### Fase 3 — Offline de Datos de Usuario
- [x] **IndexedDB para agenda** (`lib/agenda-offline-store.ts`)
  - Instalación: `idb-keyval` (lightweight promise-based wrapper)
  - Cache de agenda personal al cargarla (write-through)
  - Read-through cache: si no hay red, leer de IDB
  - Estructura: keys `migrilla:attendance`, `migrilla:mutation-queue`, `migrilla:last-sync`

- [x] **Background Sync para mutaciones offline** (`lib/background-sync.ts`)
  - Si el usuario quita un artista sin red → enqueue en IDB
  - Cuando vuelve la conexión → sincronización automática vía `syncOfflineMutations()`
  - Deduplicación: last-write-wins por artistId
  - Removes individuales, adds en batch vía `saveAttendance()`
  - Fallback a polling manual (no Background Sync API por soporte limitado)

- [x] **Indicador online/offline en UI** (`components/offline-indicator.tsx`)
  - Hook `useNetworkStatus` (`lib/hooks/use-network-status.ts`) con `navigator.onLine` + events
  - Banner persistente cuando offline: "Sin conexión" + count de cambios pendientes
  - Toast transient cuando vuelve online: "Conexión restaurada"
  - Indicador de sync: "Sincronizando cambios…" con spinner
  - Resultado de sync: "X cambios sincronizados" con feedback de éxito/fallo

- [x] **Integración en agenda** (`agenda-view.tsx`)
  - Cache automático de attendance al montar el componente
  - Detección offline → enqueue mutation en vez de server action
  - Badge de "X pendientes" en stats cuando hay mutations sin sincronizar
  - Actualización del cache IDB en cada mutación exitosa

### Fase 4 — Experiencia Premium
- [x] **Update notification** (`components/sw-update-prompt.tsx`)
  - Detecta nueva versión del Service Worker vía `updatefound` event
  - Toast: "Nueva versión disponible" con botón "Actualizar" / "Luego"
  - Botón de actualización envía `SKIP_WAITING` message al SW waiting
  - Auto-reload vía `controllerchange` event
  - Polling automático cada 60 minutos para checkear updates
  - SW handler: `message` listener para `SKIP_WAITING` en `app/sw.ts`

- [x] **Manifest mejorado con shortcuts + share_target** (`app/manifest.ts`)
  - Shortcuts: "Mi Agenda", "Grilla Completa", "Social" (acceso rápido desde long-press)
  - Share Target API (Android): recibe shares desde otras apps vía GET params

- [x] **iOS splash screens** (`app/layout.tsx`)
  - `apple-touch-startup-image` meta tags para 10 resoluciones de iPhone
  - Cubre: iPhone SE, 8, X/XS, XR/11, 12/13/14, 15 Pro, 15 Pro Max
  - Usa el ícono 512x512 como imagen de splash

- [ ] **Push notifications** (NO implementado — requiere infraestructura backend)
  - Requiere: VAPID keys, backend para enviar notificaciones, edge functions
  - Se puede agregar en el futuro cuando sea necesario

- [ ] **Deep linking / App Links** (NO implementado — requiere dominio verificado)
  - Requiere: `assetlinks.json` en `.well-known/` + dominio en producción
  - Se puede agregar cuando se configure el dominio final

---

## 📊 Resumen de Estado

| Fase | Nombre | Estado | Impacto | Dificultad |
|------|--------|--------|--------|-----------|
| 1 | PWA Instalable | ✅ Completo | ALTO | Baja |
| 2 | Offline Shell | ✅ Completo | ALTO | Media |
| 3 | Offline Datos | ✅ Completo | MEDIO-ALTO | Media |
| 4 | Premium UX | ✅ Mayormente Completo | BAJO-MEDIO | Media-Alta |

---

## 📁 Archivos Nuevos (Fases 3 y 4)

```
lib/
  agenda-offline-store.ts     # IndexedDB store (idb-keyval wrapper)
  background-sync.ts          # Offline mutation queue + sync logic
  hooks/
    use-network-status.ts     # useNetworkStatus hook (online/offline)
components/
  offline-indicator.tsx       # Network status banner/toast
  sw-update-prompt.tsx        # SW update notification prompt
```

## 📁 Archivos Modificados (Fases 3 y 4)

```
app/(app)/layout.tsx          # + OfflineIndicator, SWUpdatePrompt
app/(app)/agenda/_components/
  agenda-view.tsx             # + offline cache, queue mutations, pending badge
app/sw.ts                     # + SKIP_WAITING message handler
app/manifest.ts               # + shortcuts, share_target
app/layout.tsx                # + iOS splash screen meta tags
package.json                  # + idb-keyval dependency
```

---

## 🔗 Referencias Útiles

### Documentación
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Workers — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Serwist Docs](https://serwist.pages.dev/)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- [Share Target API](https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target)

### Tools
- **Lighthouse PWA Audit**: `pnpm build && npm start` → abrir DevTools → Lighthouse → PWA
- **Web Manifest Validator**: [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
- **Service Worker Debugger**: Chrome DevTools → Application → Service Workers
- **iOS Testing**: Simulator de Xcode o device real con Safari
- **IndexedDB Inspector**: Chrome DevTools → Application → IndexedDB

---

## 🧪 Testing Offline

1. **Build production**: `pnpm build --webpack && pnpm start`
2. **DevTools → Network → Offline**: Verificar que la agenda sigue funcionando
3. **Modificar offline**: Quitar un artista → verificar que se encola en IDB
4. **Volver online**: Verificar toast "Conexión restaurada" + auto-sync
5. **Application → IndexedDB**: Inspeccionar keys `migrilla:*`
6. **Application → Service Workers**: Verificar update detection
7. **Manifest → Shortcuts**: Long-press ícono en Android → verificar shortcuts

---

## 📝 Notas Finales

- **Build**: `pnpm build --webpack` (necesario para que Serwist funcione)
- **Dev**: `pnpm dev --turbopack` (Turbopack es rápido, Serwist está deshabilitado en dev)
- **Scripts**:
  - `scripts/generate-icons.mjs` — regenerar íconos si cambia el SVG
  - Agregar a `.gitignore`: `public/sw.js`, `public/sw.js.map`
- **Lighthouse PWA Score**: Meta es 90+
- **Browsers testeados**:
  - ✅ Chrome/Edge (Android) — funciona perfecto
  - ✅ Safari (iOS) — funciona, instalable, safe areas correctas
  - ⚠️ Brave/Firefox (iOS) — no instalable (limitación de Apple), pero app web funciona
- **Dependencia nueva**: `idb-keyval@6.2.2` — 1KB gzipped, zero dependencies

---

**Creado**: Febrero 2025  
**Última actualización**: Post Fase 4 (Offline Data + Premium UX)
