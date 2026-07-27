import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventOwnership } from "@/lib/db/queries/events";
import { removeCollaborator, getCollaboratorById } from "@/lib/db/queries/collaborators";

type RouteParams = { params: Promise<{ eventId: string; collabId: string }> };

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, collabId } = await params;
  const event = await assertEventOwnership(eventId, userId);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const collaborator = await getCollaboratorById(collabId);
  if (!collaborator || collaborator.eventId !== eventId) {
    return NextResponse.json({ error: "Colaborador no encontrado" }, { status: 404 });
  }

  await removeCollaborator(collabId);
  return NextResponse.json({ ok: true });
}
