import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { deleteGiftOption, getGiftOptionById } from "@/lib/db/queries/wizard-extras";

type RouteParams = { params: Promise<{ eventId: string; giftId: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, giftId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const gift = await getGiftOptionById(giftId);
  if (!gift || gift.eventId !== eventId) {
    return NextResponse.json({ error: "Opción no encontrada" }, { status: 404 });
  }

  await deleteGiftOption(giftId);
  return NextResponse.json({ ok: true });
}
