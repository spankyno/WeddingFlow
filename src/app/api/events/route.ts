import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEventSchema } from "@/lib/validators/event";
import { createEvent, listEventsForUser } from "@/lib/db/queries/events";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await listEventsForUser(userId);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createEvent(userId, parsed.data);
  return NextResponse.json(result, { status: 201 });
}
