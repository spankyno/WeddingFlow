import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db/queries/events";
import { CountdownSection } from "@/components/invitation/sections/countdown";
import { StorySection } from "@/components/invitation/sections/story";
import { RsvpSection } from "@/components/invitation/sections/rsvp";

// Nota: las demás secciones (gallery, video, map, agenda, dress_code, gifts,
// hotels, transport, faq, music, album) siguen el mismo patrón — un componente
// en components/invitation/sections/ que recibe `event` y se activa/oculta según
// la tabla event_sections. Se añaden incrementalmente sin tocar esta página.
export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) notFound();

  return (
    <main
      className="min-h-screen"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <section className="flex h-screen flex-col items-center justify-center text-center">
        <p className="font-body text-xs uppercase tracking-[0.4em] text-gold-dark">
          {event.eventType === "wedding" ? "Nos casamos" : "Os esperamos"}
        </p>
        <h1 className="mt-6 font-display text-6xl md:text-7xl">{event.title}</h1>
        {event.eventDate && (
          <p className="mt-6 font-body text-sm uppercase tracking-[0.3em] text-ink/60">
            {event.eventDate}
          </p>
        )}
      </section>

      {event.eventDate && <CountdownSection targetDate={event.eventDate} />}
      {event.storyText && <StorySection text={event.storyText} />}
      <RsvpSection eventSlug={event.slug} />
    </main>
  );
}
