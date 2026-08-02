import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests, guestGroups, tables } from "@drizzle/schema";
import type { CreateGuestInput, UpdateGuestInput, ImportGuestRowInput } from "@/lib/validators/guest";
import { nanoid } from "@/lib/utils";

function slugifyGuest(fullName: string) {
  return (
    fullName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    nanoid(8)
  );
}

export async function listGuestsForEvent(eventId: string) {
  const db = getDb();
  return db.select().from(guests).where(eq(guests.eventId, eventId)).all();
}

export async function getGuestStats(eventId: string) {
  const items = await listGuestsForEvent(eventId);
  return {
    total: items.length,
    confirmed: items.filter((g) => g.rsvpStatus === "confirmed").length,
    declined: items.filter((g) => g.rsvpStatus === "declined").length,
    pending: items.filter((g) => g.rsvpStatus === "pending").length,
    totalConfirmedHeadcount: items
      .filter((g) => g.rsvpStatus === "confirmed")
      .reduce((sum, g) => sum + 1 + (g.rsvpCompanionsCount ?? 0), 0),
  };
}

/** Busca un grupo por nombre dentro del evento, o lo crea si no existe. */
async function findOrCreateGuestGroup(eventId: string, name: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(guestGroups)
    .where(and(eq(guestGroups.eventId, eventId), eq(guestGroups.name, name)))
    .get();
  if (existing) return existing.id;

  const id = nanoid();
  await db.insert(guestGroups).values({ id, eventId, name, groupType: "family" });
  return id;
}

/** Busca una mesa por nombre dentro del evento, o la crea (capacidad por defecto 8) si no existe. */
async function findOrCreateTable(eventId: string, name: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(tables)
    .where(and(eq(tables.eventId, eventId), eq(tables.name, name)))
    .get();
  if (existing) return existing.id;

  const id = nanoid();
  await db.insert(tables).values({ id, eventId, name, capacity: 8 });
  return id;
}

export async function createGuest(eventId: string, input: CreateGuestInput) {
  const db = getDb();
  const id = nanoid();
  const groupId = input.groupName ? await findOrCreateGuestGroup(eventId, input.groupName) : null;

  await db.insert(guests).values({
    id,
    eventId,
    guestGroupId: groupId,
    fullName: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    isVip: input.isVip,
    isChild: input.isChild,
    maxCompanions: input.maxCompanions,
    uniqueSlug: slugifyGuest(input.fullName),
    rsvpStatus: "pending",
  });

  return { id };
}

/**
 * Alta masiva (importación Excel/CSV). Resuelve primero los grupos y mesas únicos
 * presentes en el lote para no golpear la base de datos una vez por fila.
 *
 * Importante: D1 limita cada consulta a 100 parámetros vinculados (no son 999 como en
 * SQLite normal). Cada invitado tiene 12 columnas, así que un solo INSERT con más de ~8
 * invitados ya supera ese límite y D1 lo rechaza con "too many SQL variables" — por eso
 * fallaba con 50 invitados pero no con pocos. Se trocea en lotes seguros y se envían todos
 * juntos como un batch (una sola ida y vuelta a D1, no N peticiones secuenciales).
 */
export async function bulkCreateGuests(eventId: string, inputs: ImportGuestRowInput[]) {
  const db = getDb();

  const uniqueGroupNames = [...new Set(inputs.map((g) => g.groupName).filter(Boolean))] as string[];
  const groupIdByName = new Map<string, string>();
  for (const name of uniqueGroupNames) {
    groupIdByName.set(name, await findOrCreateGuestGroup(eventId, name));
  }

  const uniqueTableNames = [...new Set(inputs.map((g) => g.tableName).filter(Boolean))] as string[];
  const tableIdByName = new Map<string, string>();
  for (const name of uniqueTableNames) {
    tableIdByName.set(name, await findOrCreateTable(eventId, name));
  }

  const rows = inputs.map((input) => ({
    id: nanoid(),
    eventId,
    guestGroupId: input.groupName ? groupIdByName.get(input.groupName) ?? null : null,
    tableId: input.tableName ? tableIdByName.get(input.tableName) ?? null : null,
    fullName: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    isVip: input.isVip,
    isChild: input.isChild,
    maxCompanions: input.maxCompanions,
    uniqueSlug: slugifyGuest(input.fullName),
    rsvpStatus: "pending" as const,
  }));

  const COLUMNS_PER_ROW = 12;
  const MAX_BOUND_PARAMS = 100;
  const CHUNK_SIZE = Math.floor(MAX_BOUND_PARAMS / COLUMNS_PER_ROW); // 8 filas por statement

  const chunks: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }

  if (chunks.length <= 1) {
    if (rows.length > 0) await db.insert(guests).values(rows);
  } else {
    const statements = chunks.map((chunk) => db.insert(guests).values(chunk));
    await db.batch(statements as [typeof statements[number], ...typeof statements]);
  }

  return { inserted: rows.length };
}

export async function updateGuest(guestId: string, input: UpdateGuestInput) {
  const db = getDb();
  const { groupName, ...rest } = input;
  await db
    .update(guests)
    .set({
      ...(rest.fullName !== undefined && { fullName: rest.fullName }),
      ...(rest.email !== undefined && { email: rest.email || null }),
      ...(rest.phone !== undefined && { phone: rest.phone || null }),
      ...(rest.isVip !== undefined && { isVip: rest.isVip }),
      ...(rest.isChild !== undefined && { isChild: rest.isChild }),
      ...(rest.maxCompanions !== undefined && { maxCompanions: rest.maxCompanions }),
      ...(rest.tableId !== undefined && { tableId: rest.tableId }),
      ...(rest.rsvpStatus !== undefined && { rsvpStatus: rest.rsvpStatus }),
    })
    .where(eq(guests.id, guestId));
}

export async function deleteGuest(guestId: string) {
  const db = getDb();
  await db.delete(guests).where(eq(guests.id, guestId));
}

export async function getGuestById(guestId: string) {
  const db = getDb();
  return db.select().from(guests).where(eq(guests.id, guestId)).get();
}

export async function unassignGuestsFromTable(tableId: string) {
  const db = getDb();
  await db.update(guests).set({ tableId: null }).where(eq(guests.tableId, tableId));
}

/** Invitación personalizada: busca al invitado por su slug único (URL no adivinable). */
export async function getGuestBySlug(guestSlug: string) {
  const db = getDb();
  return db.select().from(guests).where(eq(guests.uniqueSlug, guestSlug)).get();
}

/**
 * Búsqueda pública por nombre desde la invitación general ("busca tu invitación").
 * Coincidencia parcial, insensible a mayúsculas/acentos, limitada a 5 resultados para no
 * filtrar el listado completo de invitados ante una query vacía o muy corta.
 */
export async function findGuestsByName(eventId: string, fullName: string) {
  const db = getDb();
  const all = await listGuestsForEvent(eventId);
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const query = normalize(fullName);
  if (query.length < 2) return [];

  return all
    .filter((g) => normalize(g.fullName).includes(query))
    .slice(0, 5)
    .map((g) => ({ guestSlug: g.uniqueSlug, fullName: g.fullName }));
}
