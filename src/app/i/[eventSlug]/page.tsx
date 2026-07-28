import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getEventBySlug } from "@/lib/db/queries/events";
import { loadInvitationContent } from "@/lib/db/queries/invitation-content";
import { recordVisit } from "@/lib/db/queries/analytics";
import { InvitationView } from "@/components/invitation/invitation-view";

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) notFound();

  const content = await loadInvitationContent(event.id);

  const headerList = await headers();
  await recordVisit(event.id, headerList.get("user-agent"), headerList.get("referer"));

  return <InvitationView event={event} content={content} />;
}
