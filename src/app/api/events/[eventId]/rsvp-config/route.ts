import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventOwnership } from "@/lib/db/queries/events";
import { getRsvpConfigForEvent, updateRsvpConfig } from "@/lib/db/queries/event-config";
import { updateRsvpConfigSchema } from "@/lib/validators/event";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const config = await getRsvpConfigForEvent(eventId);
  return NextResponse.json({ config });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = updateRsvpConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateRsvpConfig(eventId, parsed.data);
  return NextResponse.json({ ok: true });
}
