import { eq, and, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { collaborators } from "@drizzle/schema";
import type { InviteCollaboratorInput } from "@/lib/validators/collaborator";
import { nanoid } from "@/lib/utils";

export async function listCollaborators(eventId: string) {
  const db = getDb();
  return db.select().from(collaborators).where(eq(collaborators.eventId, eventId)).all();
}

export async function inviteCollaborator(eventId: string, input: InviteCollaboratorInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(collaborators).values({
    id,
    eventId,
    role: input.role,
    invitedEmail: input.email,
    userId: null,
    acceptedAt: null,
  });
  return { id };
}

export async function removeCollaborator(collaboratorId: string) {
  const db = getDb();
  await db.delete(collaborators).where(eq(collaborators.id, collaboratorId));
}

export async function getCollaboratorById(collaboratorId: string) {
  const db = getDb();
  return db.select().from(collaborators).where(eq(collaborators.id, collaboratorId)).get();
}

/**
 * Se llama tras crear/actualizar un usuario (webhook de Clerk). Si ese email tenía
 * invitaciones de colaborador pendientes (creadas antes de que la persona tuviera cuenta),
 * las vincula a su userId y las marca como aceptadas.
 */
export async function linkPendingCollaboratorInvites(userId: string, email: string) {
  const db = getDb();
  const pending = await db
    .select()
    .from(collaborators)
    .where(and(eq(collaborators.invitedEmail, email), isNull(collaborators.userId)))
    .all();

  for (const invite of pending) {
    await db
      .update(collaborators)
      .set({ userId, acceptedAt: new Date().toISOString() })
      .where(eq(collaborators.id, invite.id));
  }
}
