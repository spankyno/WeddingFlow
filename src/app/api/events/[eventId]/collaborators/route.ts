import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventOwnership } from "@/lib/db/queries/events";
import { listCollaborators, inviteCollaborator } from "@/lib/db/queries/collaborators";
import { inviteCollaboratorSchema } from "@/lib/validators/collaborator";
import { sendEmail } from "@/lib/email";
import { collaboratorInviteEmail } from "@/lib/email-templates";

type RouteParams = { params: Promise<{ eventId: string }> };

// Gestionar QUIÉN colabora en el evento es una acción exclusiva del propietario
// (a diferencia de gestionar invitados/mesas/etc., que sí pueden hacer los colaboradores).
export async function GET(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const items = await listCollaborators(eventId);
  return NextResponse.json({ items });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = inviteCollaboratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await inviteCollaborator(eventId, parsed.data);

  // Best-effort: si Resend no está configurado o falla, la invitación ya ha quedado
  // registrada en D1 — se vinculará igualmente en cuanto la persona inicie sesión.
  await sendEmail({
    to: parsed.data.email,
    subject: `Te han invitado a colaborar en "${event.title}"`,
    html: collaboratorInviteEmail({
      eventTitle: event.title,
      inviterEmail: "El equipo organizador",
      acceptUrl: `${new URL(req.url).origin}/eventos/${eventId}`,
    }),
  });

  return NextResponse.json(result, { status: 201 });
}
