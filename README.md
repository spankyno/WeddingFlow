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
- ⏳ Pendiente (ver `docs/PLAN.md` → Fase 1 y Fase 2): resto de pasos del wizard, gestión de
  invitados, mesas, álbum, regalos, notificaciones, analytics, editor visual, PWA

## Requisitos

- Node 20+
- Cuenta de Cloudflare (Pages + D1 + R2, todo en capa gratuita)
- Cuenta de Clerk (capa gratuita)

## Instalación local

```bash
npm install

# Variables de entorno (crear .env.local)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...
# CLERK_WEBHOOK_SECRET=...

# Crear la base de datos D1 y pegar su id en wrangler.toml
npx wrangler d1 create weddingflow-db

# Generar y aplicar migraciones en local
npm run db:generate
npm run db:migrate:local

npm run dev
```

## Despliegue en Cloudflare Pages

```bash
npm run db:migrate:remote   # aplica el esquema a la base D1 de producción
npm run pages:deploy        # build con @cloudflare/next-on-pages + wrangler pages deploy
```

Configura en el dashboard de Cloudflare Pages las mismas variables de entorno que en
`.env.local`, más el binding `DB` (D1) y `MEDIA_BUCKET` (R2) — ya declarados en `wrangler.toml`.

En Clerk, añade un webhook `user.created` apuntando a
`https://<tu-dominio>/api/webhooks/clerk`.

## Notas de arquitectura

- Todas las rutas dinámicas usan `export const runtime = "edge"` porque Cloudflare Pages
  no soporta el runtime Node.js completo.
- D1 no tiene un driver estable para Prisma; se usa **Drizzle ORM**, el recomendado por
  Cloudflare para D1.
- Los binarios (fotos, vídeos, PDFs) se guardan en **R2**, nunca en D1 — D1 solo guarda URLs.
- Cada dominio (events, guests, tables...) tiene sus propias queries en
  `src/lib/db/queries/`, su propio validador Zod en `src/lib/validators/` y sus propios
  hooks en `src/hooks/`, siguiendo el patrón ya implementado para `events`. Añadir un nuevo
  dominio no requiere tocar el resto del sistema.
