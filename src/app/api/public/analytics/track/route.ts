import { NextResponse } from "next/server";
import { z } from "zod";
import { getEventBySlug } from "@/lib/db/queries/events";
import { getDb } from "@/lib/db/client";
import { analyticsEvents } from "@drizzle/schema";
import { nanoid } from "@/lib/utils";

const bodySchema = z.object({
  eventSlug: z.string().min(1),
  type: z.enum(["click_share", "download_pdf", "download_image"]),
});

// Ruta pública, sin sesión: la llama la propia invitación al pulsar compartir/descargar.
// Best-effort — si falla, nunca debe romper la experiencia del usuario (se llama de forma
// "fire and forget" desde el cliente).
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const event = await getEventBySlug(parsed.data.eventSlug);
  if (!event) return NextResponse.json({ ok: false }, { status: 404 });

  const db = getDb();
  await db.insert(analyticsEvents).values({
    id: nanoid(),
    eventId: event.id,
    type: parsed.data.type,
  });

  return NextResponse.json({ ok: true });
}
