import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assertEventAccess } from "@/lib/db/queries/events";
import { updateTable, deleteTable, getTableById } from "@/lib/db/queries/tables";
import { unassignGuestsFromTable } from "@/lib/db/queries/guests";
import { updateTableSchema } from "@/lib/validators/table";

type RouteParams = { params: Promise<{ eventId: string; tableId: string }> };

async function assertTableBelongsToOwnedEvent(eventId: string, tableId: string, userId: string) {
  const event = await assertEventAccess(eventId, userId);
  if (!event) return null;
  const table = await getTableById(tableId);
  if (!table || table.eventId !== eventId) return null;
  return table;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, tableId } = await params;
  const table = await assertTableBelongsToOwnedEvent(eventId, tableId, userId);
  if (!table) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = updateTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateTable(tableId, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { eventId, tableId } = await params;
  const table = await assertTableBelongsToOwnedEvent(eventId, tableId, userId);
  if (!table) return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404 });

  await unassignGuestsFromTable(tableId);
  await deleteTable(tableId);
  return NextResponse.json({ ok: true });
}
