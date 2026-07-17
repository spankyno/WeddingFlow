import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventOwnership } from "@/lib/db/queries/events";
import { createGuest, listGuestsForEvent, getGuestStats } from "@/lib/db/queries/guests";
import { createGuestSchema } from "@/lib/validators/guest";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const [items, stats] = await Promise.all([
    listGuestsForEvent(eventId),
    getGuestStats(eventId),
  ]);

  return NextResponse.json({ items, stats });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createGuest(eventId, parsed.data);
  return NextResponse.json(result, { status: 201 });
}
