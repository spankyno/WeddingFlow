import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { eventMedia } from "@drizzle/schema";
import type { CreateEventMediaInput, ReorderEventMediaInput } from "@/lib/validators/event-media";
import { nanoid } from "@/lib/utils";

export async function listEventMedia(eventId: string) {
  const db = getDb();
  return db.select().from(eventMedia).where(eq(eventMedia.eventId, eventId)).orderBy(eventMedia.sortOrder).all();
}

export async function createEventMediaItem(eventId: string, input: CreateEventMediaInput) {
  const db = getDb();
  const current = await listEventMedia(eventId);
  const id = nanoid();
  await db.insert(eventMedia).values({
    id,
    eventId,
    type: input.type,
    url: input.url,
    sortOrder: current.length,
  });
  return { id };
}

export async function deleteEventMediaItem(mediaId: string) {
  const db = getDb();
  await db.delete(eventMedia).where(eq(eventMedia.id, mediaId));
}

export async function reorderEventMedia(input: ReorderEventMediaInput) {
  const db = getDb();
  for (const item of input.items) {
    await db.update(eventMedia).set({ sortOrder: item.sortOrder }).where(eq(eventMedia.id, item.id));
  }
}

export async function getEventMediaById(mediaId: string) {
  const db = getDb();
  return db.select().from(eventMedia).where(eq(eventMedia.id, mediaId)).get();
}
