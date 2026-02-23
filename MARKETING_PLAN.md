# MiGrilla — Plan de Marketing y Distribución

> Estrategia dual: Producto + Portfolio
> Creado: Febrero 2026
> Ventana crítica: Febrero - Lollapalooza 2026 (Marzo)

---

## 🎯 Contexto estratégico

Tenés **dos audiencias** con motivaciones completamente distintas:

| Audiencia | Qué les importa | Red principal |
|-----------|----------------|---------------|
| Festival goers | "Quiero organizar mi Lolla" | Instagram, TikTok |
| Devs / Recruiters | "Este pibe sabe lo que hace" | LinkedIn, X |

**Ventana de tiempo crítica:** El Lollapalooza es en marzo. Estamos en febrero. Tenés 2-3 semanas para hacer ruido con el producto antes de que el festival pase. Después de eso, solo queda el portfolio angle.

---

## 💡 El asset viral que tenés y quizás no estás explotando

La **exportación de agenda como imagen**. Cuando un usuario arma su agenda y la comparte en sus stories, está haciendo marketing tuyo sin saberlo. Eso es UGC orgánico.

**Lo que necesitás para que esto funcione:**
- Que la imagen tenga branding visible — un logo pequeño de "MiGrilla" o la URL
- Un call to action en la app: *"Compartí tu agenda"* con un flujo súper fácil

Si 50 personas comparten su agenda con el logo de MiGrilla, eso vale más que 50 posts tuyos.

---

## 📅 Fases del plan

### FASE 1 — Pre-festival (Ahora → 1 semana antes del Lolla)
*Objetivo: awareness, conseguir primeros usuarios reales*

### FASE 2 — Festival week
*Objetivo: conversión, viralización, UGC*

### FASE 3 — Post-festival (Portfolio harvest)
*Objetivo: visibilidad profesional, oportunidades laborales*

---

## 📱 Plan por red

---

### LinkedIn — Campaña portfolio

**Audiencia:** Devs, tech leads, recruiters
**Tono:** Profesional pero apasionado, primera persona

#### Post 1 — El anuncio (hoy)

```
Arranqué el año con un side project que terminó siendo 
más grande de lo que esperaba.

Construí una PWA para el Lollapalooza Argentina.

Stack: Next.js 16 (App Router) · React 19 · Supabase · 
Tailwind CSS 4 · Canvas API nativa

Features que me enorgullecen:
→ Grilla interactiva con filtros por escenario y día
→ Agenda personal con detección de conflictos de horario
→ Exportación como imagen (1080px, Canvas API sin librerías)
→ Sistema social: amigos, grupos, comparación de agendas
→ PWA instalable con soporte offline

Lo más interesante: la imagen se genera completamente 
en el browser con Canvas API. Sin Cloudinary, sin sharp, 
sin nada. Puro browser API.

[link] → mi-grilla-app.vercel.app

¿Qué le agregarían?
```

#### Post 2 — Deep dive técnico (3-4 días después)

```
Cómo diseñé la autenticación de MiGrilla (y por qué 
elegí 3 métodos distintos)

El challenge: quería que cualquier persona pueda usar 
la app en 10 segundos sin fricción, pero también 
permitir cuentas reales para el módulo social.

Solución: sistema híbrido con Supabase Auth
→ Anónimo (solo username, sin email)
→ Email + password
→ Google OAuth
→ Upgrade de anónimo a cuenta real SIN perder data

Lo más interesante del upgrade: linkIdentity() de 
Supabase preserva toda la agenda y amigos del usuario 
anónimo. La transición es invisible para el usuario.

[explicar brevemente el flujo técnico]
```

#### Post 3 — Post festival (después del Lolla)

```
X usuarios usaron MiGrilla durante el Lollapalooza.

Lo que aprendí construyendo una app que la gente 
usa en tiempo real en un festival:
→ [learnings reales]
→ [métricas si las tenés: usuarios, agendas creadas, imágenes exportadas]
```

**Frecuencia:** 1 post por semana, no más. En LinkedIn la calidad > cantidad.

---

### Instagram — Campaña dual

**Audiencia:** Tus conocidos + festival goers via hashtags
**Tono:** Casual, mostrar la app en acción
**Formato prioritario:** Reels (el algoritmo los prioriza brutalmente sobre fotos)

#### Reel 1 — Demo del producto (esta semana)

- Grabación de pantalla de la app
- Música de fondo que pegue con el festival
- Texto superpuesto: *"Hice una app para el Lolla"*
- Mostrar: entrar → ver la grilla → marcar shows → ver la agenda → exportar imagen
- Duración: 30-45 segundos
- CTA final: *"Link en bio"*
- Hashtags: `#lollapalooza #lollapaloozaargentina #lolla2026 #festival`

#### Reel 2 — Feature highlight (agenda grupal)

- *"¿Cómo coordinan con amigos en el Lolla?"*
- Mostrar el feature de grupos
- Humanizarlo: *"Creé un grupo con mis amigos para ver quién va a cada show"*

#### Stories — Durante el festival

- Encuestas: *"¿Ya armaste tu agenda para el Lolla?"*
- Share de agendas propias y de amigos como sticker
- Repost de gente que use la app

#### Hashtags fijos para todo:

`#lollapalooza #lollapaloozaargentina #appweb #festival #desarrolloweb`

---

### TikTok — Campaña producto + dev journey

**Audiencia:** General, festival goers
**Tono:** Directo, energético, sin pretensiones
**Ventaja:** No tenés audiencia establecida = el algoritmo te puede explotar a cualquiera

#### Video 1 — El hook más simple posible

```
"Hice una app para el Lollapalooza y es gratis"
[demo de 30 segundos mostrando la grilla y la agenda]
```

#### Video 2 — Dev journey rápido

```
"Pasé X semanas haciendo esto para el Lolla"
[timelapse o montaje de screenshots del desarrollo]
```

#### Video 3 — Feature reveal

```
"¿Sabías que podés exportar tu agenda del Lolla como imagen?"
[demo del export]
```

**Tip de TikTok:** Los primeros 2 segundos son todo. El hook en texto debe aparecer inmediatamente. Si no enganchás en los primeros 2 segundos, el video muere.

---

### X — Cambio de estrategia

Tu problema en X no es el contenido, es que no estás **en las conversaciones correctas**.

**Lo que tenés que hacer:**

1. Buscar tweets de gente hablando del Lollapalooza y **responder con el link** de forma natural: *"Hice una app para armar la agenda, por si les sirve: [link]"*
2. Buscar devs que estén hablando de Next.js, Supabase, PWAs → participar en esas conversaciones, no solo postear
3. Tweetear los mismos posts de LinkedIn pero más cortos y con más personalidad

**El objetivo en X no es viralizar — es que alguien con audiencia te retweetee.** Buscá a referentes tech argentinos (Goncy, etc.) y participá en sus conversaciones.

---

## 🗓 Calendario de ejecución

| Semana | LinkedIn | Instagram | TikTok | X |
|--------|----------|-----------|--------|---|
| Esta semana | Post 1 (anuncio) | Reel 1 (demo) | Video 1 | Tweet anuncio + buscar conversaciones Lolla |
| Semana antes del festival | Post 2 (deep dive técnico) | Reel 2 (grupos) + Stories | Video 2 | Buscar tweets de Lolla |
| Festival week | — | Stories activas | Video 3 | Responder tweets del evento |
| Post-festival | Post 3 (learnings + métricas) | Recap | — | Thread técnico |

---

## ✅ Checklist inmediato (antes de publicar nada)

- [ ] Verificar que la app funciona bien en mobile (es lo que van a ver)
- [ ] Agregar branding/logo en la imagen exportada (el arma viral más importante)
- [ ] Poner la URL en bio de todas las redes
- [ ] Grabar el screen recording para el Reel/TikTok hoy

---

## 🎬 Tips de ejecución

### Para grabaciones de pantalla

1. **Emulador móvil es mejor** — usa Chrome DevTools con iPhone 15 Pro Max (375px de ancho)
2. **Usa OBS o ScreenFlow** para grabar con audio
3. **Música:** Busca algo con energía en YouTube Audio Library o Epidemic Sound
4. **Texto superpuesto:** USA Canva o DaVinci Resolve (free)

### Para las imágenes exportadas

El branding es CRÍTICO. Cada imagen que alguien comparta en Instagram/TikTok es un anuncio tuyo.

- Logo "MiGrilla" en la esquina inferior derecha (chico, no invasivo)
- La URL `mi-grilla-app.vercel.app` en la parte inferior
- Asegúrate de que sea legible a 1080px

### Engagement activo

No publiques y desaparezcas. Durante el festival:
- Responde comentarios en los Reels
- Retuitea gente que hable del Lolla
- Interactúa con perfiles tech en LinkedIn

---

## 📊 Métricas que importan

**Pre-festival:**
- Usuarios registrados
- Time on app (cuánto tiempo pasan en la grilla)

**Festival week:**
- Agendas creadas
- Imágenes exportadas
- Shares de imágenes (via URL tracking o manualmente)

**Post-festival:**
- Conversaciones laborales iniciadas (LinkedIn)
- Seguidores nuevos en X
- Inbound de recruiters

---

## 🚀 Lo más importante

**El timing es ahora.** Después del Lollapalooza, el producto angle desaparece y solo queda el portfolio angle. Tenés una ventana de 2-3 semanas para hacer ruido.

Prioritiza en este orden:
1. **Arreglar branding en imagen exportada** (es el viral más importante)
2. **LinkedIn Post 1** (establece credibilidad)
3. **Reel 1 de Instagram** (alcance orgánico)
4. **TikTok Video 1** (experimento, bajo riesgo)
5. **Buscar conversaciones en X** (ground game, poco esfuerzo)
