import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventOwnership } from "@/lib/db/queries/events";
import { bulkCreateGuests } from "@/lib/db/queries/guests";
import { bulkImportGuestsSchema } from "@/lib/validators/guest";

type RouteParams = { params: Promise<{ eventId: string }> };

// El parseo del .xlsx/.csv ocurre en el cliente (SheetJS); aquí solo se recibe JSON ya
// normalizado y se revalida con Zod fila a fila antes de tocar la base de datos.
export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = bulkImportGuestsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await bulkCreateGuests(eventId, parsed.data.guests);
  return NextResponse.json(result, { status: 201 });
}
