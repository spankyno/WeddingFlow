import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEventSchema } from "@/lib/validators/event";
import { createEvent, listEventsForUser } from "@/lib/db/queries/events";
import { ensureUserExists } from "@/lib/db/queries/users";

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

  // Red de seguridad: si el webhook de Clerk no llegó a crear la fila en `users`, la
  // creamos aquí mismo antes de insertar el evento (que depende de esa foreign key).
  await ensureUserExists(userId);

  const result = await createEvent(userId, parsed.data);
  return NextResponse.json(result, { status: 201 });
}
