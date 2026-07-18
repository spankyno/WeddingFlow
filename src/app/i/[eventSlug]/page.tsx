import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db/queries/events";
import { loadInvitationContent } from "@/lib/db/queries/invitation-content";
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

  return <InvitationView event={event} content={content} />;
}
