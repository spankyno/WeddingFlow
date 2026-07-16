import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { tables } from "@drizzle/schema";
import type { CreateTableInput, UpdateTableInput } from "@/lib/validators/table";
import { nanoid } from "@/lib/utils";

export async function listTablesForEvent(eventId: string) {
  const db = getDb();
  return db.select().from(tables).where(eq(tables.eventId, eventId)).all();
}

export async function createTable(eventId: string, input: CreateTableInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(tables).values({
    id,
    eventId,
    name: input.name,
    capacity: input.capacity,
    color: input.color,
    posX: 0,
    posY: 0,
  });
  return { id };
}

export async function updateTable(tableId: string, input: UpdateTableInput) {
  const db = getDb();
  await db
    .update(tables)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.capacity !== undefined && { capacity: input.capacity }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.posX !== undefined && { posX: input.posX }),
      ...(input.posY !== undefined && { posY: input.posY }),
    })
    .where(eq(tables.id, tableId));
}

export async function deleteTable(tableId: string) {
  const db = getDb();
  // Los invitados asignados a esta mesa no se borran: su table_id vuelve a NULL
  // (ver lógica en la ruta DELETE, que primero desasigna y luego borra la mesa).
  await db.delete(tables).where(eq(tables.id, tableId));
}

export async function getTableById(tableId: string) {
  const db = getDb();
  return db.select().from(tables).where(eq(tables.id, tableId)).get();
}
