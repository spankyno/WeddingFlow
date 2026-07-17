import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventOwnership } from "@/lib/db/queries/events";
import { updateGuest, deleteGuest, getGuestById } from "@/lib/db/queries/guests";
import { updateGuestSchema } from "@/lib/validators/guest";

type RouteParams = { params: Promise<{ eventId: string; guestId: string }> };

async function assertGuestBelongsToOwnedEvent(eventId: string, guestId: string, userId: string) {
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return null;
  const guest = await getGuestById(guestId);
  if (!guest || guest.eventId !== eventId) return null;
  return guest;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, guestId } = await params;
  const guest = await assertGuestBelongsToOwnedEvent(eventId, guestId, userId);
  if (!guest) return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = updateGuestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateGuest(guestId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, guestId } = await params;
  const guest = await assertGuestBelongsToOwnedEvent(eventId, guestId, userId);
  if (!guest) return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });

  await deleteGuest(guestId);
  return NextResponse.json({ ok: true });
}
