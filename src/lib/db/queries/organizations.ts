import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { organizations, events } from "@drizzle/schema";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "@/lib/validators/organization";
import { nanoid } from "@/lib/utils";

export async function listOrganizationsForUser(userId: string) {
  const db = getDb();
  return db.select().from(organizations).where(eq(organizations.ownerUserId, userId)).all();
}

export async function getOrganizationById(orgId: string) {
  const db = getDb();
  return db.select().from(organizations).where(eq(organizations.id, orgId)).get();
}

export async function createOrganization(userId: string, input: CreateOrganizationInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(organizations).values({ id, ownerUserId: userId, name: input.name });
  return { id };
}

export async function updateOrganization(orgId: string, input: UpdateOrganizationInput) {
  const db = getDb();
  await db.update(organizations).set({ name: input.name }).where(eq(organizations.id, orgId));
}

/**
 * Antes de borrar la organización, desvincula (no borra) los eventos que la tenían
 * asignada — organization_id es nullable precisamente para esto. Sin este paso, D1
 * rechazaría el borrado por violar la foreign key (D1 valida foreign keys por defecto).
 */
export async function deleteOrganization(orgId: string) {
  const db = getDb();
  await db.update(events).set({ organizationId: null }).where(eq(events.organizationId, orgId));
  await db.delete(organizations).where(eq(organizations.id, orgId));
}

export async function countEventsForOrganization(orgId: string) {
  const db = getDb();
  const rows = await db.select().from(events).where(eq(events.organizationId, orgId)).all();
  return rows.length;
}
