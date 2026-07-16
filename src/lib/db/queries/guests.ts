import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests, guestGroups } from "@drizzle/schema";
import type { CreateGuestInput, UpdateGuestInput } from "@/lib/validators/guest";
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
 * Alta masiva (importación Excel/CSV). Resuelve primero los grupos únicos presentes en el
 * lote para no golpear la base de datos una vez por fila, y hace una única inserción masiva.
 */
export async function bulkCreateGuests(eventId: string, inputs: CreateGuestInput[]) {
  const db = getDb();

  const uniqueGroupNames = [...new Set(inputs.map((g) => g.groupName).filter(Boolean))] as string[];
  const groupIdByName = new Map<string, string>();
  for (const name of uniqueGroupNames) {
    groupIdByName.set(name, await findOrCreateGuestGroup(eventId, name));
  }

  const rows = inputs.map((input) => ({
    id: nanoid(),
    eventId,
    guestGroupId: input.groupName ? groupIdByName.get(input.groupName) ?? null : null,
    fullName: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    isVip: input.isVip,
    isChild: input.isChild,
    maxCompanions: input.maxCompanions,
    uniqueSlug: slugifyGuest(input.fullName),
    rsvpStatus: "pending" as const,
  }));

  await db.insert(guests).values(rows);
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
