import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests, events, analyticsEvents } from "@drizzle/schema";
import { rsvpSubmitSchema } from "@/lib/validators/event";
import { nanoid } from "@/lib/utils";
import { getUserById } from "@/lib/db/queries/users";
import { sendEmail } from "@/lib/email";
import { rsvpNotificationForOwnerEmail, rsvpConfirmationForGuestEmail } from "@/lib/email-templates";

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
      ...(parsed.data.email && { email: parsed.data.email }),
      ...(parsed.data.phone && { phone: parsed.data.phone }),
    })
    .where(eq(guests.id, guest.id));

  await db.insert(analyticsEvents).values({
    id: nanoid(),
    eventId: guest.eventId,
    type: "rsvp_submit",
  });

  // Best-effort: si el email falla, el RSVP ya se ha guardado igualmente en D1.
  const event = await db.select().from(events).where(eq(events.id, guest.eventId)).get();
  if (event) {
    const owner = await getUserById(event.ownerUserId);
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: `${guest.fullName} ha respondido a tu invitación`,
        html: rsvpNotificationForOwnerEmail({
          eventTitle: event.title,
          guestName: guest.fullName,
          willAttend: parsed.data.willAttend,
          companionsCount: parsed.data.companionsCount,
          dietaryRestrictions: parsed.data.dietaryRestrictions,
          message: parsed.data.message,
        }),
      });
    }

    const guestEmail = parsed.data.email || guest.email;
    if (guestEmail) {
      await sendEmail({
        to: guestEmail,
        subject: `Confirmación recibida — ${event.title}`,
        html: rsvpConfirmationForGuestEmail({
          eventTitle: event.title,
          guestName: guest.fullName,
          willAttend: parsed.data.willAttend,
        }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
