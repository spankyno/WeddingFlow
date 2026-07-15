import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests, analyticsEvents } from "@drizzle/schema";
import { rsvpSubmitSchema } from "@/lib/validators/event";
import { nanoid } from "@/lib/utils";

export const runtime = "edge";

// Ruta pública: la usa el invitado sin sesión, identificado por su slug único (no adivinable).
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = rsvpSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const guest = await db
    .select()
    .from(guests)
    .where(eq(guests.uniqueSlug, parsed.data.guestSlug))
    .get();

  if (!guest) {
    return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
  }

  await db
    .update(guests)
    .set({
      rsvpStatus: parsed.data.willAttend ? "confirmed" : "declined",
      rsvpCompanionsCount: parsed.data.companionsCount,
      rsvpDietaryRestrictions: parsed.data.dietaryRestrictions,
      rsvpMessage: parsed.data.message,
      rsvpRespondedAt: new Date().toISOString(),
    })
    .where(eq(guests.id, guest.id));

  await db.insert(analyticsEvents).values({
    id: nanoid(),
    eventId: guest.eventId,
    type: "rsvp_submit",
  });

  return NextResponse.json({ ok: true });
}
