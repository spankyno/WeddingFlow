import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { eventThemes, eventSections, rsvpFormConfig } from "@drizzle/schema";
import type { UpdateThemeInput } from "@/lib/validators/event";
import type { UpdateSectionsInput, UpdateRsvpConfigInput } from "@/lib/validators/event";

/* -------------------------------------- Tema -------------------------------------- */
// event_themes se crea siempre junto con el evento (ver createEvent), así que aquí solo
// hace falta UPDATE, nunca INSERT.

export async function getThemeForEvent(eventId: string) {
  const db = getDb();
  return db.select().from(eventThemes).where(eq(eventThemes.eventId, eventId)).get();
}

export async function updateTheme(eventId: string, input: UpdateThemeInput) {
  const db = getDb();
  await db
    .update(eventThemes)
    .set({
      themePreset: input.themePreset,
      colorPrimary: input.colorPrimary,
      colorSecondary: input.colorSecondary,
      colorText: input.colorText,
      colorButton: input.colorButton,
      colorBackground: input.colorBackground,
      fontHeading: input.fontHeading,
      fontBody: input.fontBody,
    })
    .where(eq(eventThemes.eventId, eventId));
}

/* ------------------------------------ Secciones ------------------------------------ */
// event_sections también se crea siempre (una fila por cada sectionKey) al crear el
// evento, así que aquí solo actualizamos filas existentes, nunca insertamos nuevas.

export async function listSectionsForEvent(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(eventSections)
    .where(eq(eventSections.eventId, eventId))
    .orderBy(eventSections.sortOrder)
    .all();
}

export async function updateSections(eventId: string, input: UpdateSectionsInput) {
  const db = getDb();
  // D1 no tiene "upsert de lote" cómodo desde Drizzle para este caso (clave compuesta
  // eventId+sectionKey), así que se actualiza fila a fila; son como mucho 15 secciones.
  for (const section of input.sections) {
    await db
      .update(eventSections)
      .set({ isEnabled: section.isEnabled, sortOrder: section.sortOrder })
      .where(
        and(eq(eventSections.eventId, eventId), eq(eventSections.sectionKey, section.sectionKey))
      );
  }
}

/* ---------------------------------- RSVP config ---------------------------------- */

export async function getRsvpConfigForEvent(eventId: string) {
  const db = getDb();
  return db.select().from(rsvpFormConfig).where(eq(rsvpFormConfig.eventId, eventId)).get();
}

export async function updateRsvpConfig(eventId: string, input: UpdateRsvpConfigInput) {
  const db = getDb();
  await db
    .update(rsvpFormConfig)
    .set({
      askPhone: input.askPhone,
      askEmail: input.askEmail,
      askCompanions: input.askCompanions,
      askDietary: input.askDietary,
      askChildren: input.askChildren,
      askMessage: input.askMessage,
    })
    .where(eq(rsvpFormConfig.eventId, eventId));
}
