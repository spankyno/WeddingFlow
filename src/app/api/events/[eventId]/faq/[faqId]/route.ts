import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { deleteFaq, getFaqById } from "@/lib/db/queries/wizard-extras";

type RouteParams = { params: Promise<{ eventId: string; faqId: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, faqId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const faq = await getFaqById(faqId);
  if (!faq || faq.eventId !== eventId) {
    return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
  }

  await deleteFaq(faqId);
  return NextResponse.json({ ok: true });
}
