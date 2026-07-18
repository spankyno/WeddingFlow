import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/db/queries/events";
import { createSongSuggestion } from "@/lib/db/queries/songs";
import { createSongSuggestionSchema } from "@/lib/validators/song";
import { z } from "zod";

const bodySchema = createSongSuggestionSchema.extend({ eventSlug: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await getEventBySlug(parsed.data.eventSlug);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const result = await createSongSuggestion(event.id, parsed.data);
  return NextResponse.json(result, { status: 201 });
}
