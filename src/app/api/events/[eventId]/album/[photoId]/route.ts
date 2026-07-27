import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { updateAlbumPhotoStatus, deleteAlbumPhoto, getAlbumPhotoById } from "@/lib/db/queries/album";
import { updateAlbumPhotoStatusSchema } from "@/lib/validators/album";

type RouteParams = { params: Promise<{ eventId: string; photoId: string }> };

async function assertPhotoBelongsToOwnedEvent(eventId: string, photoId: string, userId: string) {
  const event = await assertEventAccess(eventId, userId);
  if (!event) return null;
  const photo = await getAlbumPhotoById(photoId);
  if (!photo || photo.eventId !== eventId) return null;
  return photo;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, photoId } = await params;
  const photo = await assertPhotoBelongsToOwnedEvent(eventId, photoId, userId);
  if (!photo) return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = updateAlbumPhotoStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateAlbumPhotoStatus(photoId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, photoId } = await params;
  const photo = await assertPhotoBelongsToOwnedEvent(eventId, photoId, userId);
  if (!photo) return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });

  await deleteAlbumPhoto(photoId);
  return NextResponse.json({ ok: true });
}
