import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { deleteAgendaItem, getAgendaItemById } from "@/lib/db/queries/wizard-extras";

type RouteParams = { params: Promise<{ eventId: string; itemId: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, itemId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const item = await getAgendaItemById(itemId);
  if (!item || item.eventId !== eventId) {
    return NextResponse.json({ error: "Elemento no encontrado" }, { status: 404 });
  }

  await deleteAgendaItem(itemId);
  return NextResponse.json({ ok: true });
}
