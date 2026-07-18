import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/db/queries/events";
import { findGuestsByName } from "@/lib/db/queries/guests";
import { lookupGuestByNameSchema } from "@/lib/validators/guest";

// Ruta pública (sin sesión): el invitado busca su propia invitación por nombre desde la
// página general del evento, y se le redirige a su enlace personalizado si hay una única
// coincidencia clara.
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = lookupGuestByNameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await getEventBySlug(parsed.data.eventSlug);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const matches = await findGuestsByName(event.id, parsed.data.fullName);
  return NextResponse.json({ matches });
}
