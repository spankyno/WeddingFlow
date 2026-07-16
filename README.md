# WeddingFlow

Invitaciones digitales de boda (y comuniones, bautizos, cumpleaños, eventos corporativos)
en un mismo motor. Next.js 15 + Cloudflare Pages + D1 + Clerk.

Ver el plan de desarrollo completo, esquema de base de datos y arquitectura en
[`docs/PLAN.md`](./docs/PLAN.md).

## Estado actual

Este repositorio contiene la **Fase 0 (fundación) + el arranque de la Fase 1 (MVP)**:

- ✅ Esquema completo de base de datos (todas las tablas del spec) en `drizzle/schema.ts`
- ✅ Auth con Clerk (middleware, sign-in/sign-up, webhook de sincronización de usuarios)
- ✅ Landing page completa (hero, características, plantillas, precios, contacto)
- ✅ Dashboard con listado/creación de eventos
- ✅ Wizard: pasos 1 (info básica) y 2 (tema) funcionales end-to-end; pasos 3–14 documentados
  con el mismo patrón, listos para implementarse sin refactorizar nada
- ✅ Invitación pública (`/i/[slug]`) con hero, cuenta atrás, historia y RSVP funcional
- ✅ Gestión de invitados: alta manual, edición de estado RSVP, borrado, estadísticas
  (confirmados/pendientes/rechazados/asistentes totales)
- ✅ Importación de invitados desde Excel/CSV: subida de archivo, auto-detección y mapeo
  manual de columnas, preview con validación fila a fila, import por lotes de hasta 500
- ✅ Mesas: editor visual drag & drop (`@dnd-kit`) para asignar invitados a mesas, control
  de capacidad, colores, creación/borrado de mesas
- ⏳ Pendiente (ver `docs/PLAN.md` → Fase 1 y Fase 2): resto de pasos del wizard, álbum,
  regalos, notificaciones, analytics, editor visual de la invitación, PWA

## Requisitos

- Node 20+
- Cuenta de Cloudflare (Workers + D1 + R2, todo en capa gratuita)
- Cuenta de Clerk (capa gratuita)

## 1. Instalación local

```bash
npm install
```

Crea `.env.local` a partir de `.env.example` y rellena las claves de Clerk (las obtienes en
el paso 3):

```bash
cp .env.example .env.local
```

## 2. Login en Cloudflare y creación de recursos

```bash
npx wrangler login

# Crea la base de datos D1 y copia el "database_id" que devuelve
npx wrangler d1 create weddingflow-db

# Crea el bucket R2 para fotos/vídeos/PDFs
npx wrangler r2 bucket create weddingflow-media
```

Pega el `database_id` real en `wrangler.toml` (sustituye `REPLACE_WITH_YOUR_D1_DATABASE_ID`).

## 3. Configurar Clerk

1. Crea una app en https://dashboard.clerk.com (capa gratuita).
2. Copia `Publishable key` y `Secret key` a `.env.local`.
3. En **Webhooks**, añade un endpoint para el evento `user.created` apuntando a
   `https://<tu-dominio>/api/webhooks/clerk` (una vez desplegado) y copia el *signing secret*
   a `CLERK_WEBHOOK_SECRET`.

## 4. Migraciones de base de datos

```bash
npm run db:generate          # genera el SQL a partir de drizzle/schema.ts
npm run db:migrate:local     # aplica el esquema a D1 en local (Miniflare)
```

## 5. Primer arranque en local

```bash
npm run dev
```

Abre `http://localhost:3000`. Gracias a `initOpenNextCloudflareForDev` en `next.config.js`,
`next dev` ya tiene acceso a los bindings reales de D1/R2 vía Miniflare, tal y como se
comportarán en producción.

## 6. Primer build y despliegue a Cloudflare

```bash
npm run db:migrate:remote    # aplica el esquema a la base D1 de producción
npm run cf:build             # opennextjs-cloudflare build: compila el Worker
npm run cf:preview           # opcional: prueba el build localmente con wrangler antes de publicar
npm run cf:deploy            # opennextjs-cloudflare deploy: publica el Worker
```

El primer `cf:deploy` te pedirá confirmar el nombre del Worker (`weddingflow`, definido en
`wrangler.toml`) y publicará una URL tipo `weddingflow.<tu-subdominio>.workers.dev`.

Configura en el dashboard de Cloudflare (Workers & Pages → weddingflow → Settings →
Variables) las mismas variables que en `.env.local`
(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`) como
**secrets**, o desde CLI:

```bash
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put CLERK_WEBHOOK_SECRET
```

Los bindings `DB` (D1) y `MEDIA_BUCKET` (R2) ya quedan conectados automáticamente porque
están declarados en `wrangler.toml`.

## 7. Dominio propio (opcional)

En el dashboard: Workers & Pages → weddingflow → Settings → Domains & Routes → Add Custom
Domain. Una vez añadido, actualiza el webhook de Clerk del paso 3 con el dominio definitivo.

## Notas de arquitectura

- Se despliega como **Cloudflare Worker** (no Pages) usando el adaptador
  **`@opennextjs/cloudflare`** — es la vía que recomiendan hoy tanto Cloudflare como el
  equipo de Next.js. El antiguo `@cloudflare/next-on-pages` quedó en modo mantenimiento y
  solo soportaba el runtime "Edge"; con OpenNext las rutas ya no necesitan
  `export const runtime = "edge"`.
- D1 no tiene un driver estable para Prisma; se usa **Drizzle ORM**, el recomendado por
  Cloudflare para D1.
- Los binarios (fotos, vídeos, PDFs) se guardan en **R2**, nunca en D1 — D1 solo guarda URLs.
- Cada dominio (events, guests, tables...) tiene sus propias queries en
  `src/lib/db/queries/`, su propio validador Zod en `src/lib/validators/` y sus propios
  hooks en `src/hooks/`, siguiendo el patrón ya implementado para `events`. Añadir un nuevo
  dominio no requiere tocar el resto del sistema.
