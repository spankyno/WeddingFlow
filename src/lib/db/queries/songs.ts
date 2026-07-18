import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { songSuggestions, guests } from "@drizzle/schema";
import type { UpdateSongStatusInput } from "@/lib/validators/song";
import { nanoid } from "@/lib/utils";

export async function listSongSuggestions(eventId: string) {
  const db = getDb();
  return db.select().from(songSuggestions).where(eq(songSuggestions.eventId, eventId)).all();
}

export async function listApprovedSongSuggestions(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(songSuggestions)
    .where(and(eq(songSuggestions.eventId, eventId), eq(songSuggestions.status, "approved")))
    .all();
}

/** El invitado sugiere una canción desde la invitación pública (guestSlug opcional: puede ser anónimo). */
export async function createSongSuggestion(
  eventId: string,
  input: { title: string; artist?: string; guestSlug?: string }
) {
  const db = getDb();
  let guestId: string | null = null;
  if (input.guestSlug) {
    const guest = await db.select().from(guests).where(eq(guests.uniqueSlug, input.guestSlug)).get();
    guestId = guest?.id ?? null;
  }

  const id = nanoid();
  await db.insert(songSuggestions).values({
    id,
    eventId,
    guestId,
    title: input.title,
    artist: input.artist || null,
    status: "pending",
  });
  return { id };
}

export async function updateSongStatus(songId: string, input: UpdateSongStatusInput) {
  const db = getDb();
  await db.update(songSuggestions).set({ status: input.status }).where(eq(songSuggestions.id, songId));
}

export async function deleteSongSuggestion(songId: string) {
  const db = getDb();
  await db.delete(songSuggestions).where(eq(songSuggestions.id, songId));
}

export async function getSongSuggestionById(songId: string) {
  const db = getDb();
  return db.select().from(songSuggestions).where(eq(songSuggestions.id, songId)).get();
}
