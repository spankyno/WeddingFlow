import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@drizzle/schema";

export async function getUserById(userId: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.id, userId)).get();
}

export async function findUserByEmail(email: string) {
  const db = getDb();
  return db.select().from(users).where(eq(users.email, email)).get();
}
