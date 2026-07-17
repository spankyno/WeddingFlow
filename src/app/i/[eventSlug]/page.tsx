import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/db/queries/events";
import { getThemeForEvent, listSectionsForEvent } from "@/lib/db/queries/event-config";
import { CountdownSection } from "@/components/invitation/sections/countdown";
import { StorySection } from "@/components/invitation/sections/story";
import { RsvpSection } from "@/components/invitation/sections/rsvp";
import { ClosingMessageSection } from "@/components/invitation/sections/closing-message";

// Nota: las secciones que aún no tienen componente propio (gallery, video, map, agenda,
// dress_code, gifts, hotels, transport, faq, music, album) ya se respetan en el orden y
// activación que vienen de `event_sections` — solo falta añadir su componente visual
// siguiendo el mismo patrón que CountdownSection/StorySection cuando se aborden esos pasos
// del wizard (6-11). No renderizarlas todavía no rompe nada: simplemente no aparecen.
export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);
  if (!event) notFound();

  const [theme, sections] = await Promise.all([
    getThemeForEvent(event.id),
    listSectionsForEvent(event.id),
  ]);

  const enabledKeys = new Set(
    sections.filter((s) => s.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.sectionKey)
  );

  const fontHeading = theme?.fontHeading ?? "Cormorant Garamond";
  const fontBody = theme?.fontBody ?? "Jost";
  const fontsToLoad = [...new Set([fontHeading, fontBody])];

  return (
    <main
      className="min-h-screen"
      style={{
        fontFamily: `"${fontBody}", sans-serif`,
        backgroundColor: theme?.colorBackground ?? undefined,
        color: theme?.colorText ?? undefined,
      }}
    >
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?${fontsToLoad
          .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600`)
          .join("&")}&display=swap`}
      />

      <section className="flex h-screen flex-col items-center justify-center text-center">
        <p
          className="text-xs uppercase tracking-[0.4em]"
          style={{ color: theme?.colorSecondary ?? undefined }}
        >
          {event.eventType === "wedding" ? "Nos casamos" : "Os esperamos"}
        </p>
        <h1
          className="mt-6 text-6xl md:text-7xl"
          style={{ fontFamily: `"${fontHeading}", serif` }}
        >
          {event.title}
        </h1>
        {event.eventDate && (
          <p className="mt-6 text-sm uppercase tracking-[0.3em] opacity-60">{event.eventDate}</p>
        )}
      </section>

      {enabledKeys.has("countdown") && event.eventDate && (
        <CountdownSection targetDate={event.eventDate} />
      )}
      {enabledKeys.has("story") && event.storyText && <StorySection text={event.storyText} />}
      {enabledKeys.has("rsvp") && <RsvpSection eventSlug={event.slug} />}
      {event.closingMessage && <ClosingMessageSection text={event.closingMessage} />}
    </main>
  );
}
