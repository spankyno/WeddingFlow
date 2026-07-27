import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { deleteTransportOption, getTransportOptionById } from "@/lib/db/queries/wizard-extras";

type RouteParams = { params: Promise<{ eventId: string; optionId: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, optionId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const option = await getTransportOptionById(optionId);
  if (!option || option.eventId !== eventId) {
    return NextResponse.json({ error: "Opción no encontrada" }, { status: 404 });
  }

  await deleteTransportOption(optionId);
  return NextResponse.json({ ok: true });
}
