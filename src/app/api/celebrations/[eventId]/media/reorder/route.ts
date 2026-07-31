import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { reorderEventMedia } from "@/lib/db/queries/event-media";
import { reorderEventMediaSchema } from "@/lib/validators/event-media";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = reorderEventMediaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await reorderEventMedia(parsed.data);
  return NextResponse.json({ ok: true });
}
