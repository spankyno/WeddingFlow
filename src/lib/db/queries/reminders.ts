import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { events, guests } from "@drizzle/schema";

function daysFromToday(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

/**
 * Eventos publicados cuya fecha es exactamente dentro de `daysBefore` días — se usa para
 * mandar un recordatorio a los invitados que todavía no han confirmado. Al comparar por
 * fecha exacta (no por rango), cada evento solo entra en esta lista un día concreto, así
 * que llamar a este endpoint una vez al día evita recordatorios duplicados sin necesidad
 * de guardar una marca de "ya enviado".
 */
export async function getEventsNeedingPreReminder(daysBefore: number) {
  const db = getDb();
  const targetDate = daysFromToday(daysBefore);
  return db
    .select()
    .from(events)
    .where(and(eq(events.status, "published"), eq(events.eventDate, targetDate)))
    .all();
}

/** Eventos cuya fecha fue exactamente hace `daysAfter` días — para el mensaje de agradecimiento. */
export async function getEventsNeedingThankYou(daysAfter: number) {
  const db = getDb();
  const targetDate = daysFromToday(-daysAfter);
  return db
    .select()
    .from(events)
    .where(and(eq(events.status, "published"), eq(events.eventDate, targetDate)))
    .all();
}

export async function getPendingGuestsWithEmail(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(guests)
    .where(and(eq(guests.eventId, eventId), eq(guests.rsvpStatus, "pending")))
    .all()
    .then((rows) => rows.filter((g) => Boolean(g.email)));
}

export async function getConfirmedGuestsWithEmail(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(guests)
    .where(and(eq(guests.eventId, eventId), eq(guests.rsvpStatus, "confirmed")))
    .all()
    .then((rows) => rows.filter((g) => Boolean(g.email)));
}
