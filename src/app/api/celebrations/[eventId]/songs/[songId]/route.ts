import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { updateSongStatus, deleteSongSuggestion, getSongSuggestionById } from "@/lib/db/queries/songs";
import { updateSongStatusSchema } from "@/lib/validators/song";

type RouteParams = { params: Promise<{ eventId: string; songId: string }> };

async function assertSongBelongsToOwnedEvent(eventId: string, songId: string, userId: string) {
  const event = await assertEventAccess(eventId, userId);
  if (!event) return null;
  const song = await getSongSuggestionById(songId);
  if (!song || song.eventId !== eventId) return null;
  return song;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, songId } = await params;
  const song = await assertSongBelongsToOwnedEvent(eventId, songId, userId);
  if (!song) return NextResponse.json({ error: "Canción no encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSongStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateSongStatus(songId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, songId } = await params;
  const song = await assertSongBelongsToOwnedEvent(eventId, songId, userId);
  if (!song) return NextResponse.json({ error: "Canción no encontrada" }, { status: 404 });

  await deleteSongSuggestion(songId);
  return NextResponse.json({ ok: true });
}
