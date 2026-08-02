import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "@/lib/db/queries/organizations";
import { updateOrganizationSchema } from "@/lib/validators/organization";

type RouteParams = { params: Promise<{ orgId: string }> };

async function assertOrgOwnership(orgId: string, userId: string) {
  const org = await getOrganizationById(orgId);
  if (!org || org.ownerUserId !== userId) return null;
  return org;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { orgId } = await params;
  const org = await assertOrgOwnership(orgId, userId);
  if (!org) return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateOrganization(orgId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { orgId } = await params;
  const org = await assertOrgOwnership(orgId, userId);
  if (!org) return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });

  await deleteOrganization(orgId);
  return NextResponse.json({ ok: true });
}
