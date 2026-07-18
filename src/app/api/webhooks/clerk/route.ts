import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { users } from "@drizzle/schema";
import { linkPendingCollaboratorInvites } from "@/lib/db/queries/collaborators";

// Configurar en el dashboard de Clerk: evento "user.created" → esta URL.
// CLERK_WEBHOOK_SECRET debe estar definido como variable de entorno / secret de Pages.
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: any;
  try {
    event = new Webhook(secret).verify(payload, headers);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const db = getDb();
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses?.[0]?.email_address ?? "";

    await db.insert(users).values({
      id,
      email,
      fullName: [first_name, last_name].filter(Boolean).join(" "),
      avatarUrl: image_url,
    });

    if (email) {
      await linkPendingCollaboratorInvites(id, email);
    }
  }

  return NextResponse.json({ ok: true });
}
