import { eq, and, isNotNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { events, eventThemes, eventSections, sectionKeyEnum, rsvpFormConfig, dressCode, collaborators } from "@drizzle/schema";
import type { CreateEventInput, UpdateEventDetailsInput } from "@/lib/validators/event";
import { nanoid } from "@/lib/utils";

const DEFAULT_ENABLED_SECTIONS = [
  "story",
  "countdown",
  "gallery",
  "map",
  "agenda",
  "rsvp",
  "faq",
] as const;

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    nanoid(6)
  );
}

export async function listEventsForUser(userId: string) {
  const db = getDb();
  return db.select().from(events).where(eq(events.ownerUserId, userId)).all();
}

export async function getEventById(eventId: string) {
  const db = getDb();
  return db.select().from(events).where(eq(events.id, eventId)).get();
}

export async function getEventBySlug(slug: string) {
  const db = getDb();
  return db.select().from(events).where(eq(events.slug, slug)).get();
}

/**
 * Crea un evento con sus registros relacionados 1:1 por defecto (tema, secciones activas).
 * Es el punto de entrada del wizard (paso 1 → esto se llama al pulsar "Continuar").
 */
export async function createEvent(userId: string, input: CreateEventInput) {
  const db = getDb();
  const id = nanoid();
  const slug = slugify(input.title);

  await db.insert(events).values({
    id,
    ownerUserId: userId,
    organizationId: input.organizationId || null,
    eventType: input.eventType,
    slug,
    title: input.title,
    eventDate: input.eventDate,
    eventTime: input.eventTime,
    ceremonyLocationName: input.ceremonyLocationName,
    ceremonyLat: input.ceremonyLat,
    ceremonyLng: input.ceremonyLng,
    celebrationLocationName: input.celebrationLocationName,
    celebrationLat: input.celebrationLat,
    celebrationLng: input.celebrationLng,
    storyText: input.storyText,
    status: "draft",
  });

  await db.insert(eventThemes).values({
    id: nanoid(),
    eventId: id,
    themePreset: "elegante",
  });

  await db.insert(eventSections).values(
    sectionKeyEnum.map((key, index) => ({
      id: nanoid(),
      eventId: id,
      sectionKey: key,
      isEnabled: (DEFAULT_ENABLED_SECTIONS as readonly string[]).includes(key),
      sortOrder: index,
    }))
  );

  await db.insert(rsvpFormConfig).values({ id: nanoid(), eventId: id });

  await db.insert(dressCode).values({ id: nanoid(), eventId: id });

  return { id, slug };
}

export async function updateEventDetails(eventId: string, input: UpdateEventDetailsInput) {
  const db = getDb();
  await db
    .update(events)
    .set({
      ...(input.closingMessage !== undefined && { closingMessage: input.closingMessage || null }),
      ...(input.status !== undefined && { status: input.status }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(events.id, eventId));
}

export async function deleteEvent(eventId: string, userId: string) {
  const db = getDb();
  // onDelete: cascade en el esquema limpia todas las tablas hijas (invitados, mesas, etc.)
  await db.delete(events).where(eq(events.id, eventId));
}

/**
 * Comprueba que el evento existe y pertenece al usuario autenticado.
 * Se usa al entrar en cualquier ruta de sub-recurso (invitados, mesas, regalos...)
 * para no depender solo del middleware de Clerk, que únicamente valida sesión, no propiedad.
 */
export async function assertEventOwnership(eventId: string, userId: string) {
  const event = await getEventById(eventId);
  if (!event || event.ownerUserId !== userId) return null;
  return event;
}

/**
 * Como assertEventOwnership, pero además permite el acceso a colaboradores ya aceptados
 * del evento (cualquier rol). Se usa en los sub-recursos de contenido (invitados, mesas,
 * wizard, álbum...) para que un colaborador pueda ayudar a gestionar el evento. La gestión
 * de la propia lista de colaboradores y el borrado del evento siguen siendo solo del dueño
 * (ver assertEventOwnership).
 */
export async function assertEventAccess(eventId: string, userId: string) {
  const event = await getEventById(eventId);
  if (!event) return null;
  if (event.ownerUserId === userId) return event;

  const db = getDb();
  const collaborator = await db
    .select()
    .from(collaborators)
    .where(
      and(
        eq(collaborators.eventId, eventId),
        eq(collaborators.userId, userId),
        isNotNull(collaborators.acceptedAt)
      )
    )
    .get();

  return collaborator ? event : null;
}
