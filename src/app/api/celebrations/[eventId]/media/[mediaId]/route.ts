import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { deleteEventMediaItem, getEventMediaById } from "@/lib/db/queries/event-media";

type RouteParams = { params: Promise<{ eventId: string; mediaId: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, mediaId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const media = await getEventMediaById(mediaId);
  if (!media || media.eventId !== eventId) {
    return NextResponse.json({ error: "Elemento no encontrado" }, { status: 404 });
  }

  await deleteEventMediaItem(mediaId);
  return NextResponse.json({ ok: true });
}
