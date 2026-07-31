# WeddingFlow

Invitaciones digitales de boda (y comuniones, bautizos, cumpleaños, eventos corporativos)
en un mismo motor. Next.js 15 + Cloudflare Workers (OpenNext) + D1 + Clerk.

Ver el plan de desarrollo completo, esquema de base de datos y arquitectura en
[`docs/PLAN.md`](./docs/PLAN.md).

## Estado actual

Este repositorio contiene la **Fase 0 (fundación) + el arranque de la Fase 1 (MVP)**:

- ✅ Esquema completo de base de datos (todas las tablas del spec) en `drizzle/schema.ts`
- ✅ Auth con Clerk (middleware, sign-in/sign-up, webhook de sincronización de usuarios)
- ✅ Landing page completa (hero, características, plantillas, precios, contacto)
- ✅ Dashboard con listado/creación de eventos
- ✅ **Wizard completo, los 14 pasos**: info básica, tema, paleta, tipografía, secciones,
  agenda, dress code, lista de regalos, hoteles, transporte, FAQ, config. del formulario de
  RSVP, mensaje final y vista previa + publicación. Todos funcionales end-to-end.
- ✅ Invitación pública (`/i/[slug]`) ya usa el tema (colores/tipografía) y renderiza todas
  las secciones configurables del wizard en el orden y activación elegidos: hero, cuenta
  atrás, historia, agenda, dress code, hoteles, transporte, regalos, RSVP, FAQ y mensaje
  final. Pendientes de componente visual: galería, vídeo, mapa, música y álbum — necesitan
  un proveedor de storage (ver nota de R2 más abajo)
- ✅ Publicar/despublicar evento, y compartir (copiar enlace, WhatsApp, email) desde el
  resumen del evento y desde el paso 14 del wizard
- ✅ Gestión de invitados: alta manual, edición de estado RSVP, borrado, estadísticas
  (confirmados/pendientes/rechazados/asistentes totales)
- ✅ Importación de invitados desde Excel/CSV: subida de archivo, auto-detección y mapeo
  manual de columnas, preview con validación fila a fila, import por lotes de hasta 500
- ✅ Mesas: editor visual drag & drop (`@dnd-kit`) para asignar invitados a mesas, control
  de capacidad, colores, creación/borrado de mesas
- ✅ **Invitación personalizada por invitado** (`/i/[slug]/[guestSlug]`): saludo con su
  nombre, mesa asignada, y el formulario de RSVP real (antes solo existía la invitación
  general, que ahora usa un buscador por nombre para redirigir a la personalizada — se
  arregló un bug por el que el RSVP general nunca guardaba nada)
- ✅ Código QR por invitado + diálogo de invitar (enlace, WhatsApp, email, descargar QR)
  desde la tabla de invitados
- ✅ Import de Excel avanzado: asignación de mesa por nombre (se crea si no existe) y
  plantilla de ejemplo descargable
- ✅ Música: los invitados sugieren canciones desde la invitación, los novios las
  aprueban/rechazan desde el dashboard
- ✅ Álbum colaborativo: subida de fotos vía Cloudinary (unsigned upload, sin servidor
  propio), moderación desde el dashboard — **requiere configurar Cloudinary**, ver más abajo
- ✅ Notificaciones por email (Resend): al organizador cuando alguien confirma/rechaza, y
  confirmación al propio invitado — **requiere configurar Resend**, ver más abajo
- ✅ Roles y colaboradores: invitar por email, vinculación automática al crear cuenta,
  acceso de edición a todo el contenido del evento (invitados, mesas, wizard...); solo el
  propietario gestiona la lista de colaboradores
- ⏳ Pendiente (ver `docs/PLAN.md` → Fase 2): analytics, editor visual de la invitación
  (reordenar bloques tipo Canva), PWA, recordatorios automáticos programados (necesitan un
  cron handler dedicado en el Worker, más allá del alcance de OpenNext por defecto)

## Despliegue 100% desde el navegador (sin CLI ni instalación local)

Si no vas a usar terminal ni Node en local, este es el camino: subir el código a GitHub
arrastrando archivos, y conectar Cloudflare a ese repo para que compile y despliegue él
solo. El esquema de base de datos se pega directamente en la consola SQL de D1 desde el
propio dashboard.

### Paso 1 — Descomprime el proyecto en tu ordenador

Descomprime el `.zip` con el gestor de archivos habitual (doble clic). No hace falta nada
más de momento; solo necesitas ver la carpeta `weddingflow` con sus archivos dentro.

### Paso 2 — Crea el repositorio en GitHub

1. Ve a https://github.com/new
2. Nómbralo, por ejemplo, `weddingflow` → **Create repository** (déjalo vacío, sin README)

### Paso 3 — Sube los archivos arrastrándolos

1. En el repo recién creado, pulsa **Add file → Upload files**
2. **Importante**: abre la carpeta `weddingflow` que descomprimiste y arrastra **todo su
   contenido** (`src`, `drizzle`, `docs`, `package.json`, `wrangler.toml`, etc.) — no la
   carpeta `weddingflow` en sí. Si arrastras la carpeta contenedora, todo quedará anidado
   un nivel de más y Cloudflare no encontrará `package.json` en la raíz.
3. Si tu explorador de archivos oculta archivos que empiezan por punto (`.gitignore`,
   `.env.example`), actívalos desde sus ajustes de "mostrar archivos ocultos" — aunque no
   son estrictamente necesarios para que el build funcione, es mejor incluirlos.
4. Baja al final de la página y pulsa **Commit changes**

Con 63 archivos en total, entra sin problema en una sola subida (el límite de GitHub por
subida vía navegador es de 100 archivos).

### Paso 4 — Crea la base de datos D1 (dashboard)

1. En https://dash.cloudflare.com, ve a **Storage & Databases → D1**
2. **Create Database** → nombre `weddingflow-db` → **Create**
3. Copia el **Database ID** que se muestra en la página de la base de datos

### Paso 5 — Pega el Database ID en `wrangler.toml` (editor web de GitHub)

1. En tu repo de GitHub, abre `wrangler.toml`
2. Pulsa el icono de lápiz (editar) arriba a la derecha del archivo
3. Sustituye `REPLACE_WITH_YOUR_D1_DATABASE_ID` por el ID que copiaste en el paso 4
4. **Commit changes** directamente en `main`

### Paso 6 — Crea la app de Clerk (auth)

1. https://dashboard.clerk.com → crea una aplicación nueva
2. Copia `Publishable key` y `Secret key` — los usarás en el paso 7
3. Deja abierta la sección **Webhooks**; volveremos a ella en el paso 10

### Paso 7 — Conecta el repo a Cloudflare Workers (Workers Builds)

1. En el dashboard de Cloudflare: **Workers & Pages → Create application → Import a
   repository**
2. Conecta tu cuenta de GitHub y selecciona el repo `weddingflow`
3. Cloudflare detectará `wrangler.toml` y Next.js automáticamente. Revisa/ajusta:
   - **Build command**: `npm run cf:build`
   - **Deploy command**: `npx wrangler deploy` (suele venir puesto por defecto)
   - **Root directory**: déjalo en blanco (el código está en la raíz del repo)
4. **Importante — esto es distinto de las variables de runtime**: Cloudflare tiene dos
   secciones de variables separadas para un Worker conectado a Git. Ve a **Settings →
   Builds → "Build variables and secrets"** (no la de "Variables and Secrets" a secas, esa
   es solo para runtime) y añade ahí:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` = `/dashboard`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` = `/dashboard`
   - Si ya tienes tus claves de Cloudinary (álbum) a mano, añádelas también aquí — si no,
     puedes volver a este paso más adelante. Ver **"Configurar el álbum colaborativo"** más
     abajo. `RESEND_API_KEY` no hace falta aquí (solo en el paso 8, es de runtime).

   Next.js incrusta las variables `NEXT_PUBLIC_*` en el bundle durante `next build`, y
   también necesita `CLERK_SECRET_KEY` en ese momento para poder pre-renderizar páginas
   como `/_not-found`. Si estas variables solo existen en la sección de runtime, el build
   falla con `Missing publishableKey` aunque en producción "debería" funcionar.
5. **Save and Deploy**

El binding `DB` (D1) no requiere configuración aparte aquí: Cloudflare lo lee directamente
de `wrangler.toml`, que ya subiste con el ID correcto.

### Paso 8 — Añade las mismas claves también como variables de runtime

Las "Build variables" del paso anterior solo existen durante la compilación — el Worker ya
desplegado, al atender peticiones reales, lee sus variables de un sitio aparte. Ve a **tu
Worker → Settings → Variables and Secrets** y añade (como *secret* las que son claves
privadas):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY` (como secret)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` = `/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` = `/dashboard`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (álbum)
- `RESEND_API_KEY` como secret (notificaciones por email)

Sin este paso, el build puede llegar a completarse pero cualquier ruta que llame a
`auth()` (el dashboard, las rutas de API...) fallará en producción por falta de la clave.

Si necesitas añadir o editar variables más adelante, son estas dos secciones — ambas están
en el dashboard, sin CLI:
- **Settings → Builds → "Build variables and secrets"** → variables del paso de compilación
- **Settings → Variables and Secrets** → variables de runtime (el Worker ya desplegado)

### Paso 9 — Primer build

Cloudflare arrancará el build automáticamente en cuanto guardes la configuración del paso
7 (no hace falta esperar al paso 8 para que arranque, pero si el build ya terminó antes de
añadir las variables de runtime, no pasa nada — solo repite el deploy después). Sigue el
progreso en **tu Worker → Deployments**. Cuando termine, tendrás una URL tipo
`weddingflow.<tu-subdominio>.workers.dev`.

### Paso 10 — Crea las tablas en D1 (sin CLI)

1. **Storage & Databases → D1 → weddingflow-db → Console**
2. Abre el archivo `drizzle/schema.sql` del repo (en GitHub, clic para verlo) y copia todo
   su contenido
3. Pégalo en la consola de D1 y ejecútalo — crea las 20 tablas del esquema de un tirón

> Si tu base de datos ya existía de una iteración anterior del proyecto (por ejemplo, ya
> habías ejecutado `schema.sql` antes de que se añadiera alguna columna nueva), no vuelvas
> a ejecutar `schema.sql` entero — fallaría porque las tablas ya existen. En su lugar, mira
> la carpeta `drizzle/migrations-manual/` del repo: cada archivo numerado es un cambio
> incremental (por ejemplo, añadir una columna) que se pega y ejecuta igual en la consola
> de D1, uno por uno, en orden.

### Paso 11 — Webhook de Clerk

1. Vuelve a Clerk → **Webhooks → Add Endpoint**
2. URL: `https://<tu-worker>.workers.dev/api/webhooks/clerk`
3. Evento: `user.created`
4. Copia el **Signing Secret** → en Cloudflare, tu Worker → **Settings → Variables and
   Secrets → Add** → `CLERK_WEBHOOK_SECRET` (como *secret*, no texto plano)

### Paso 12 — Prueba

Abre tu URL `.workers.dev`, regístrate, crea un evento desde el wizard y comprueba que
aparece en `/dashboard`. Cada vez que subas cambios a `main` en GitHub (arrastrando
archivos nuevos o editando desde el propio editor web), Cloudflare reconstruye y despliega
solo — es el mismo flujo de "Workers Builds" que acabas de configurar.

### Cambios futuros sin CLI

Para editar código después: en GitHub, navega al archivo, pulsa el lápiz, edita en el
editor web, y haz commit a `main` (o arrastra un archivo nuevo con **Add file → Upload
files** para sustituir uno existente). Cada commit dispara un build+deploy automático en
Cloudflare.

---

## Pruebas

Cubren la lógica pura más sensible a errores silenciosos: import de Excel (mapeo de
columnas, detección de booleanos, normalización de filas), validadores de invitados/RSVP,
generación de `.ics`, e integridad de los presets de tema.

```bash
npm test            # corre toda la suite una vez
npm run test:watch  # modo watch, útil mientras desarrollas
```

No requieren CLI de Cloudflare ni base de datos — son pruebas unitarias puras con Vitest.

## Alternativa: despliegue con CLI en local

Si en el futuro quieres usar terminal (por ejemplo, para trabajar con Claude Code u otro
entorno con consola), este es el flujo equivalente a los pasos de arriba pero con Wrangler
CLI.

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
`next dev` ya tiene acceso al binding real de D1 vía Miniflare, tal y como se comportará en
producción.

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

El binding `DB` (D1) ya queda conectado automáticamente porque está declarado en
`wrangler.toml`.

## 7. Dominio propio (opcional)

En el dashboard: Workers & Pages → weddingflow → Settings → Domains & Routes → Add Custom
Domain. Una vez añadido, actualiza el webhook de Clerk del paso 3 con el dominio definitivo.

## Configurar los recordatorios automáticos diarios

Cloudflare Workers no permite añadir un cron nativo sin reconstruir a mano el Worker que
genera OpenNext (arriesgado). En su lugar, se usa un endpoint HTTP protegido
(`/api/system/cron/reminders`) que dispara diariamente un workflow de **GitHub Actions**
(gratis, ya incluido en tu repo en `.github/workflows/reminders.yml`). Cada día revisa si
hay eventos a 7 días vista con invitados sin confirmar (les manda un recordatorio) o eventos
de hace 1 día (manda un agradecimiento a los confirmados).

1. Genera un secreto cualquiera (por ejemplo, con https://www.uuidgenerator.net/ o
   cualquier cadena larga aleatoria que se te ocurra)
2. Añádelo en **Cloudflare → tu Worker → Settings → Variables and Secrets** como secret:
   - `CRON_SECRET`
3. Añade el mismo valor en **GitHub → tu repo → Settings → Secrets and variables →
   Actions → New repository secret**:
   - Nombre: `CRON_SECRET`
   - Valor: el mismo que pusiste en Cloudflare
4. Revisa que la URL dentro de `.github/workflows/reminders.yml` coincide con tu dominio
   real (`weddingflow.<tu-subdominio>.workers.dev` o tu dominio propio si has añadido uno)
5. El workflow se ejecuta solo cada día a las 8:00 UTC. Para probarlo ya mismo sin esperar:
   en GitHub, pestaña **Actions → Enviar recordatorios diarios → Run workflow**

Sin `CRON_SECRET` configurado en Cloudflare, el endpoint devuelve error 500 en vez de
enviar nada — no falla de forma silenciosa.

## Configurar el álbum colaborativo (Cloudinary)

1. Crea una cuenta gratuita en https://cloudinary.com (no pide tarjeta)
2. En el dashboard, copia tu **Cloud name** (aparece arriba a la izquierda)
3. Ve a **Settings → Upload → Upload presets → Add upload preset**
4. Ponle un nombre, y en **Signing Mode** elige **Unsigned** — esto es lo que permite subir
   fotos directamente desde el navegador del invitado sin pasar por tu servidor
5. Guarda, y añade estas dos variables (en Cloudflare: tanto en "Build variables" como en
   "Variables and Secrets" de runtime, igual que las de Clerk):
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → tu Cloud name
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` → el nombre del preset que acabas de crear

Sin esto configurado, la sección de álbum simplemente no muestra el botón de subir foto
(no rompe nada, solo queda inactiva).

## Configurar las notificaciones por email (Resend)

1. Crea una cuenta gratuita en https://resend.com (no pide tarjeta)
2. **API Keys → Create API Key** → cópiala
3. Añádela como variable — **esta va solo en "Variables and Secrets" de runtime, como
   secret** (no hace falta en build, los emails se envían al recibir peticiones, no al
   compilar):
   - `RESEND_API_KEY`

**Limitación real del plan gratuito sin dominio propio**: Resend solo te deja enviar
emails a la dirección con la que te registraste, hasta que verifiques un dominio propio
(gratis, pero necesitas tener un dominio y añadir un par de registros DNS — instrucciones
en su dashboard, sección **Domains**). Hasta entonces, en la práctica solo tú recibirás las
notificaciones aunque el código ya esté enviándolas para cualquier invitado.

Sin `RESEND_API_KEY` configurada, el envío de emails simplemente se omite (se registra un
aviso en los logs) — el RSVP se sigue guardando con normalidad.

## Notas de arquitectura

- Se despliega como **Cloudflare Worker** (no Pages) usando el adaptador
  **`@opennextjs/cloudflare`** — es la vía que recomiendan hoy tanto Cloudflare como el
  equipo de Next.js. El antiguo `@cloudflare/next-on-pages` quedó en modo mantenimiento y
  solo soportaba el runtime "Edge"; con OpenNext las rutas ya no necesitan
  `export const runtime = "edge"`.
- D1 no tiene un driver estable para Prisma; se usa **Drizzle ORM**, el recomendado por
  Cloudflare para D1.
- **R2 (fotos/vídeo/PDFs) queda fuera del proyecto por ahora**: requiere añadir tarjeta de
  crédito a la cuenta de Cloudflare aunque el uso caiga en capa gratuita. D1 solo guarda
  metadatos/URLs; cuando se aborde el álbum colaborativo (Fase 2) se integrará un proveedor
  externo sin tarjeta (Cloudinary, ImageKit...) — ver nota en `docs/PLAN.md`.
- `cloudflare-env.d.ts` (generado con `wrangler types`) va **incluido en el repo** con los
  tipos del binding `DB`. Si más adelante cambias algo en `wrangler.toml` (añades un
  binding, por ejemplo), regenera este archivo con `npm run cf:typegen` y vuelve a subirlo
  — si no, TypeScript no reconocerá el nuevo binding y el build fallará en el chequeo de
  tipos.
- `.npmrc` fuerza `legacy-peer-deps=true` como red de seguridad: Clerk v6 declara rangos de
  peer dependencies muy estrictos con React/Next que a veces van por delante de las
  versiones que fijamos en `package.json`; esto evita que un `npm install` falle por eso
  (Cloudflare usa `bun install` por defecto, que ya es permisivo con esto, pero así queda
  cubierto también si en algún momento cambia a npm).
- Cada dominio (events, guests, tables...) tiene sus propias queries en
  `src/lib/db/queries/`, su propio validador Zod en `src/lib/validators/` y sus propios
  hooks en `src/hooks/`, siguiendo el patrón ya implementado para `events`. Añadir un nuevo
  dominio no requiere tocar el resto del sistema.
