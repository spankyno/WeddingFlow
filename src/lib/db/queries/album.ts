import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { albumPhotos, guests } from "@drizzle/schema";
import type { UpdateAlbumPhotoStatusInput } from "@/lib/validators/album";
import { nanoid } from "@/lib/utils";

export async function listAlbumPhotos(eventId: string) {
  const db = getDb();
  return db.select().from(albumPhotos).where(eq(albumPhotos.eventId, eventId)).all();
}

export async function listApprovedAlbumPhotos(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(albumPhotos)
    .where(and(eq(albumPhotos.eventId, eventId), eq(albumPhotos.status, "approved")))
    .all();
}

export async function createAlbumPhoto(eventId: string, input: { url: string; guestSlug?: string }) {
  const db = getDb();
  let guestId: string | null = null;
  if (input.guestSlug) {
    const guest = await db.select().from(guests).where(eq(guests.uniqueSlug, input.guestSlug)).get();
    guestId = guest?.id ?? null;
  }

  const id = nanoid();
  await db.insert(albumPhotos).values({
    id,
    eventId,
    guestId,
    url: input.url,
    status: "pending",
  });
  return { id };
}

export async function updateAlbumPhotoStatus(photoId: string, input: UpdateAlbumPhotoStatusInput) {
  const db = getDb();
  await db.update(albumPhotos).set({ status: input.status }).where(eq(albumPhotos.id, photoId));
}

export async function deleteAlbumPhoto(photoId: string) {
  const db = getDb();
  await db.delete(albumPhotos).where(eq(albumPhotos.id, photoId));
}

export async function getAlbumPhotoById(photoId: string) {
  const db = getDb();
  return db.select().from(albumPhotos).where(eq(albumPhotos.id, photoId)).get();
}
