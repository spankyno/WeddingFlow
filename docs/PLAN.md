# WeddingFlow — Plan de Desarrollo

## Stack definitivo

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Animación**: Framer Motion
- **Auth**: Clerk
- **Base de datos**: Cloudflare D1 (SQLite) + Drizzle ORM (D1 no soporta Prisma de forma nativa/estable; Drizzle es el estándar recomendado por Cloudflare)
- **Storage de archivos**: Cloudflare R2 (fotos, vídeos, PDFs generados) — D1 solo guarda metadatos/URLs, no binarios
- **Validación**: Zod + React Hook Form
- **Data fetching / cache cliente**: TanStack Query
- **Colas / tareas diferidas** (recordatorios, envío de emails): Cloudflare Queues + Cron Triggers
- **Email**: Resend (plan gratuito) vía Cloudflare Worker
- **WhatsApp**: WhatsApp Cloud API (Meta, tier gratuito) — enlace `wa.me` como fallback sin coste
- **Despliegue**: Cloudflare Workers, vía el adaptador **`@opennextjs/cloudflare`**

> Nota técnica (actualizada): la vía recomendada hoy por Cloudflare y por el propio equipo
> de Next.js para desplegar Next.js en Cloudflare es **Workers + OpenNext**, no Cloudflare
> Pages con `@cloudflare/next-on-pages` (ese paquete quedó en modo mantenimiento). Con
> OpenNext las rutas corren en un runtime compatible con Node.js sobre Workers (flag
> `nodejs_compat`), por lo que **ya no hace falta** forzar `export const runtime = 'edge'`
> en cada ruta dinámica, a diferencia de lo que exigía next-on-pages.

---

## Fase 0 — Fundación (antes de cualquier feature)

- Repo, monorepo simple (no se necesita Turborepo para este alcance)
- Config de Drizzle + `wrangler.toml` + binding D1
- Config de Clerk (middleware, rutas protegidas)
- Sistema de diseño base: tokens de color/tipografía, componentes shadcn instalados, tema claro/oscuro
- CI mínimo: typecheck + lint + build en cada push

**Entregable**: proyecto arranca en local (`next dev`) y en preview de Cloudflare, con login funcionando y layout base.

---

## Fase 1 — MVP (lo mínimo para que una boda real funcione de punta a punta)

Objetivo: un usuario puede registrarse, crear **una** boda, personalizarla mínimamente, invitar gente y recibir confirmaciones.

1. Auth (Clerk) + creación automática de `user` en D1 vía webhook de Clerk
2. Dashboard: listar bodas, crear boda (nombre + fecha), eliminar
3. Wizard reducido: Paso 1 (info básica), Paso 2 (tema, de una lista fija de 6), Paso 5 (activar/desactivar secciones), Paso 12 (formulario de confirmación), Paso 14 (preview)
4. Invitación pública renderizada por slug (`/i/[slug]`), con secciones: hero, historia, cuenta atrás, mapa, confirmación
5. Gestión de invitados: alta manual, tabla, estado (pendiente/confirmado/rechazado), enlace único por invitado (sin QR todavía)
6. Confirmación de asistencia: formulario público que escribe en D1 y actualiza estado del invitado
7. Panel de confirmaciones en tiempo real (polling con TanStack Query, no WebSockets aún)
8. Compartir: copiar enlace, botón WhatsApp (`wa.me`), botón email (`mailto:`)
9. Landing page completa (hero, features, plantillas, precios, contacto) — sin backend, contenido estático + formulario de contacto simple

**Entregable**: producto usable por una pareja real para gestionar una boda sencilla.

---

## Fase 2 — Versión 1.0 (paridad con el spec funcional)

1. Wizard completo (14 pasos): paleta y tipografía con selector de Google Fonts, agenda multi-evento, dress code, lista de regalos (IBAN/Bizum/PayPal/Amazon), hoteles, transporte, FAQ dinámico
2. Importación de invitados desde Excel/CSV (parseo en cliente, validación con Zod, preview antes de confirmar)
3. Agrupación de invitados: familias, parejas, niños, VIP
4. Códigos QR únicos por invitado (generados on-the-fly, sin almacenar imagen — se guarda el payload y se renderiza)
5. Gestión de mesas: editor visual drag & drop (dnd-kit), capacidad configurable, asignación de invitados
6. Álbum colaborativo: subida de fotos por invitados a R2, moderación por los novios
7. Música: invitados sugieren canciones (búsqueda simple por texto, no integración Spotify en MVP de esta fase), novios aprueban/rechazan
8. Notificaciones: email transaccional (confirmación recibida, recordatorio X días antes) vía Resend + Cron Trigger
9. Exportar invitación a PDF (generación server-side con `@react-pdf/renderer`, compatible edge)
10. Descargar invitación como imagen (captura server-side con un servicio ligero tipo `satori` + `resvg`, compatible edge — evita Puppeteer, que no corre en Cloudflare Pages)
11. Añadir al calendario (ICS genérico que sirve para Apple/Google/Outlook, sin integraciones OAuth)
12. Analytics básico: visitas, confirmaciones, dispositivo (user-agent), sin librería de terceros — tabla propia `analytics_event`
13. Roles: administrador (dueño), colaborador (edición limitada) — invitación por email
14. Editor visual tipo Canva simplificado: reordenar secciones (drag & drop de bloques ya definidos) + editar colores/tipografía por bloque. **No** es un editor de layout libre tipo Canva real (eso es Fase 3, altísimo coste); en 1.0 es "reordenar y personalizar bloques predefinidos"
15. PWA: manifest + service worker básico (cache de assets estáticos, no offline-first completo)
16. Motor multi-evento: abstraer `wedding` a `event` con `event_type` (boda, comunión, bautizo, cumpleaños, corporativo) reutilizando el mismo modelo de datos

**Entregable**: producto con paridad funcional completa frente al spec, listo para primeros usuarios reales.

---

## Fase 3 — Futuro (no bloquea el lanzamiento)

- Editor de layout verdaderamente libre (drag & drop de posición/tamaño arbitrario, tipo Canva real)
- Integración WhatsApp Business API completa (envío masivo, plantillas aprobadas por Meta)
- Integración Spotify/Apple Music real para sugerencias musicales
- Modo offline completo (PWA offline-first con sincronización)
- Multi-idioma en la invitación (i18n de cara al invitado, no solo del panel)
- Marketplace de plantillas de terceros / creadores
- App móvil nativa (Expo) reutilizando la API
- Facturación (cuando se decida monetizar; hoy todo en capa gratuita)
- WebSockets reales para confirmaciones en vivo (Durable Objects de Cloudflare)

---

## Esquema de base de datos (Drizzle / D1 — SQLite)

Diseñado para que **una boda sea un caso particular de `event`**, permitiendo reutilizar el motor para comuniones, bautizos, cumpleaños y eventos corporativos sin cambiar el esquema.

```
users
  id (pk, text, = clerk user id)
  email
  full_name
  avatar_url
  created_at

organizations                -- permite "Wedding Planner" con varios eventos de distintos clientes
  id (pk)
  owner_user_id (fk -> users.id)
  name
  created_at

events                       -- antes "weddings". Genérico para boda/comunión/bautizo/cumpleaños/corporativo
  id (pk)
  organization_id (fk -> organizations.id, nullable)
  owner_user_id (fk -> users.id)
  event_type (enum: wedding | communion | baptism | birthday | corporate)
  slug (unique, text)        -- usado en la URL pública /i/[slug]
  title                      -- ej. "Laura & Marcos"
  event_date
  event_time
  ceremony_location_name
  ceremony_lat
  ceremony_lng
  celebration_location_name
  celebration_lat
  celebration_lng
  story_text
  cover_image_url
  status (enum: draft | published | archived)
  created_at
  updated_at

event_media                  -- galería y vídeo del evento
  id (pk)
  event_id (fk)
  type (enum: image | video)
  url
  sort_order

event_themes                 -- tema + paleta + tipografía (paso 2, 3, 4 del wizard)
  id (pk)
  event_id (fk, unique)
  theme_preset (enum: minimalista | elegante | boho | vintage | moderno | luxury | floral | playa | invierno | personalizado)
  color_primary
  color_secondary
  color_text
  color_button
  color_background
  font_heading
  font_body

event_sections                -- qué bloques están activos y en qué orden (paso 5 + editor visual)
  id (pk)
  event_id (fk)
  section_key (enum: story | countdown | gallery | video | map | agenda | dress_code
                      | gifts | rsvp | hotels | transport | faq | contact | music | album)
  is_enabled (bool)
  sort_order

agenda_items                  -- paso 6
  id (pk)
  event_id (fk)
  title                       -- "Ceremonia", "Cóctel"...
  time
  description
  location

dress_code                    -- paso 7 (1:1 con event)
  id (pk)
  event_id (fk, unique)
  description_text
  color_1
  color_2
  color_3
  inspiration_gallery_json     -- array de URLs

gift_options                  -- paso 8
  id (pk)
  event_id (fk)
  method (enum: iban | bizum | paypal | transfer | amazon_list | custom_list)
  label
  value                        -- IBAN, número de bizum, link de paypal.me, link de lista...
  message

hotels                        -- paso 9
  id (pk)
  event_id (fk)
  name
  address
  price_hint
  website_url
  phone
  lat
  lng

transport_options             -- paso 10
  id (pk)
  event_id (fk)
  type (enum: bus | parking | taxi | directions)
  description
  details_json

faqs                          -- paso 11
  id (pk)
  event_id (fk)
  question
  answer
  sort_order

rsvp_form_config              -- paso 12: qué campos pedir
  id (pk)
  event_id (fk, unique)
  ask_phone (bool)
  ask_email (bool)
  ask_companions (bool)
  ask_dietary (bool)
  ask_children (bool)
  ask_message (bool)

guest_groups                  -- familias / parejas
  id (pk)
  event_id (fk)
  name
  group_type (enum: family | couple | individual)

guests
  id (pk)
  event_id (fk)
  guest_group_id (fk, nullable)
  full_name
  email
  phone
  is_vip (bool)
  is_child (bool)
  max_companions
  table_id (fk -> tables.id, nullable)
  unique_slug (unique)          -- para URL personalizada /i/[eventSlug]/[guestSlug]
  rsvp_status (enum: pending | confirmed | declined)
  rsvp_companions_count
  rsvp_dietary_restrictions
  rsvp_message
  rsvp_responded_at
  created_at

tables                        -- mesas
  id (pk)
  event_id (fk)
  name
  capacity
  color
  pos_x                        -- posición en el plano visual
  pos_y

song_suggestions              -- música
  id (pk)
  event_id (fk)
  guest_id (fk, nullable)
  title
  artist
  status (enum: pending | approved | rejected)

album_photos                  -- álbum colaborativo
  id (pk)
  event_id (fk)
  guest_id (fk, nullable)
  url
  status (enum: pending | approved | rejected)
  created_at

collaborators                 -- roles
  id (pk)
  event_id (fk)
  user_id (fk)
  role (enum: admin | organizer | wedding_planner | collaborator)
  invited_email
  accepted_at

analytics_events
  id (pk)
  event_id (fk)
  type (enum: visit | rsvp_submit | click_share | download_pdf | download_image)
  device_type
  referrer
  created_at
```

Índices clave: `events.slug` (unique), `guests.unique_slug` (unique), `guests.event_id`, `analytics_events.event_id + created_at`.

---

## Arquitectura de carpetas

```
weddingflow/
├── docs/
│   └── PLAN.md
├── drizzle/
│   ├── schema.ts                 # esquema completo (arriba)
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # landing pública
│   │   │   ├── page.tsx
│   │   │   ├── precios/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...rest]]/page.tsx
│   │   │   └── sign-up/[[...rest]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # sidebar + topbar, protegido por Clerk middleware
│   │   │   ├── dashboard/page.tsx
│   │   │   └── eventos/
│   │   │       ├── page.tsx                       # listado
│   │   │       ├── nuevo/page.tsx                 # wizard entrypoint
│   │   │       └── [eventId]/
│   │   │           ├── page.tsx                   # resumen / editar
│   │   │           ├── wizard/[step]/page.tsx
│   │   │           ├── invitados/page.tsx
│   │   │           ├── mesas/page.tsx
│   │   │           ├── confirmaciones/page.tsx
│   │   │           ├── album/page.tsx
│   │   │           ├── regalos/page.tsx
│   │   │           └── analytics/page.tsx
│   │   ├── i/[eventSlug]/
│   │   │   ├── page.tsx           # invitación pública genérica
│   │   │   └── [guestSlug]/page.tsx  # invitación personalizada por invitado
│   │   └── api/
│   │       ├── webhooks/clerk/route.ts
│   │       ├── events/[id]/route.ts
│   │       ├── guests/route.ts
│   │       └── rsvp/route.ts
│   ├── components/
│   │   ├── ui/                    # shadcn
│   │   ├── marketing/             # hero, features, gallery, pricing...
│   │   ├── dashboard/
│   │   ├── wizard/
│   │   │   └── steps/             # un componente por paso
│   │   └── invitation/
│   │       └── sections/          # un componente por bloque (story, countdown, map...)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts          # drizzle + binding D1
│   │   │   └── queries/           # funciones por dominio (events.ts, guests.ts...)
│   │   ├── validators/            # esquemas Zod, compartidos cliente/servidor
│   │   ├── auth.ts                # helpers de Clerk
│   │   └── utils.ts
│   ├── hooks/                     # hooks de TanStack Query por dominio
│   ├── styles/
│   │   └── themes/                # tokens por preset de tema
│   └── middleware.ts              # Clerk route protection
├── wrangler.toml
├── drizzle.config.ts
├── next.config.js
├── package.json
└── README.md
```

**Regla de modularidad**: cada dominio (events, guests, tables, gifts...) tiene su propio archivo de queries en `lib/db/queries/`, su propio validador Zod en `lib/validators/`, y sus propios hooks en `hooks/`. Nada de lógica de negocio dentro de los componentes de página — los componentes de página solo orquestan hooks + componentes de presentación. Esto permite añadir un nuevo `event_type` (ej. cumpleaños) sin tocar el resto del sistema, solo añadiendo configuración de secciones/tema por defecto.

---

## Flujo de navegación

```
Landing (/) 
  → Sign up / Sign in (Clerk)
    → Dashboard (/dashboard)
        → Crear evento → Wizard (14 pasos, /eventos/[id]/wizard/1..14)
            → al completar → /eventos/[id] (resumen)
        → Lista de eventos → click → /eventos/[id]
            ├── Editar (reabre wizard en el paso deseado)
            ├── Invitados (/eventos/[id]/invitados)
            │     → alta manual | importar Excel | generar enlace único
            ├── Mesas (/eventos/[id]/mesas) — drag & drop
            ├── Confirmaciones (/eventos/[id]/confirmaciones) — tiempo real (polling)
            ├── Álbum (/eventos/[id]/album) — moderar fotos
            ├── Regalos (/eventos/[id]/regalos)
            ├── Analytics (/eventos/[id]/analytics)
            └── Enviar invitaciones → genera enlaces por invitado → WhatsApp / Email / copiar

Invitado (sin login) recibe enlace:
  /i/[eventSlug]/[guestSlug]
    → ve invitación personalizada
    → confirma asistencia (formulario)
    → sugiere canción
    → sube foto al álbum
    → descarga PDF / añade a calendario
```
