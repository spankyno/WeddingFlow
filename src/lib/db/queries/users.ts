import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/client";
import { users } from "@drizzle/schema";
import { linkPendingCollaboratorInvites } from "@/lib/db/queries/collaborators";

export async function getUserById(userId: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.id, userId)).get();
}

export async function findUserByEmail(email: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.email, email)).get();
}

/**
 * Red de seguridad frente al webhook de Clerk: si por lo que sea la fila en `users` nunca
 * se creó (webhook no configurado todavía, secret incorrecto, entrega fallida, o el usuario
 * se registró antes de que existiera el webhook), esto la crea al vuelo la primera vez que
 * hace falta — por ejemplo, justo antes de crear un evento, para no violar la foreign key
 * `events.owner_user_id -> users.id` (D1 valida las foreign keys por defecto).
 */
export async function ensureUserExists(userId: string) {
  const existing = await getUserById(userId);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const db = getDb();
  await db
    .insert(users)
    .values({
      id: userId,
      email,
      fullName: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" "),
      avatarUrl: clerkUser.imageUrl,
    })
    .onConflictDoNothing();

  if (email) {
    await linkPendingCollaboratorInvites(userId, email);
  }

  return getUserById(userId);
}
