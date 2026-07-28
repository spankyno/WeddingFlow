import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getEventBySlug } from "@/lib/db/queries/events";
import { getGuestBySlug } from "@/lib/db/queries/guests";
import { getTableById } from "@/lib/db/queries/tables";
import { loadInvitationContent } from "@/lib/db/queries/invitation-content";
import { recordVisit } from "@/lib/db/queries/analytics";
import { InvitationView } from "@/components/invitation/invitation-view";

export default async function PersonalizedInvitationPage({
  params,
}: {
  params: Promise<{ eventSlug: string; guestSlug: string }>;
}) {
  const { eventSlug, guestSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) notFound();

  const guest = await getGuestBySlug(guestSlug);
  if (!guest || guest.eventId !== event.id) notFound();

  const [content, table] = await Promise.all([
    loadInvitationContent(event.id),
    guest.tableId ? getTableById(guest.tableId) : Promise.resolve(null),
  ]);

  const headerList = await headers();
  await recordVisit(event.id, headerList.get("user-agent"), headerList.get("referer"));

  return (
    <InvitationView
      event={event}
      content={content}
      guest={{
        fullName: guest.fullName,
        uniqueSlug: guest.uniqueSlug,
        tableName: table?.name ?? null,
      }}
    />
  );
}
