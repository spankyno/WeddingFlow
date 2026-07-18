import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { listHotels, createHotel } from "@/lib/db/queries/wizard-extras";
import { createHotelSchema } from "@/lib/validators/wizard-extras";

type RouteParams = { params: Promise<{ eventId: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const items = await listHotels(eventId);
  return NextResponse.json({ items });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventAccess(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createHotelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createHotel(eventId, parsed.data);
  return NextResponse.json(result, { status: 201 });
}
