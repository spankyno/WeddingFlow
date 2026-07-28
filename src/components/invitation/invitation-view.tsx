import type { InvitationContent } from "@/lib/db/queries/invitation-content";
import { CountdownSection } from "@/components/invitation/sections/countdown";
import { StorySection } from "@/components/invitation/sections/story";
import { GuestLookupSection } from "@/components/invitation/sections/guest-lookup";
import { RsvpSection } from "@/components/invitation/sections/rsvp";
import { ClosingMessageSection } from "@/components/invitation/sections/closing-message";
import { AgendaSection } from "@/components/invitation/sections/agenda";
import { DressCodeSection } from "@/components/invitation/sections/dress-code";
import { GiftsSection } from "@/components/invitation/sections/gifts";
import { HotelsSection } from "@/components/invitation/sections/hotels";
import { TransportSection } from "@/components/invitation/sections/transport";
import { FaqSection } from "@/components/invitation/sections/faq";
import { MusicSection } from "@/components/invitation/sections/music";
import { AlbumSection } from "@/components/invitation/sections/album";
import { AddToCalendarButton } from "@/components/invitation/add-to-calendar-button";

type EventRow = {
  slug: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  eventTime: string | null;
  ceremonyLocationName: string | null;
  storyText: string | null;
  closingMessage: string | null;
};

type GuestInfo = {
  fullName: string;
  uniqueSlug: string;
  tableName?: string | null;
};

// Nota: gallery, video y map siguen sin componente visual propio (necesitan un mapa
// embebido o storage adicional) — el resto de las secciones del spec original ya están
// todas implementadas y respetan el orden/activación configurados en el wizard.
export function InvitationView({
  event,
  content,
  guest,
}: {
  event: EventRow;
  content: InvitationContent;
  guest?: GuestInfo;
}) {
  const { theme, enabledKeys } = content;
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
        <p className="text-xs uppercase tracking-[0.4em]" style={{ color: theme?.colorSecondary ?? undefined }}>
          {event.eventType === "wedding" ? "Nos casamos" : "Os esperamos"}
        </p>
        {guest && (
          <p className="mt-4 text-sm uppercase tracking-[0.3em] opacity-70">
            Querid{guest.fullName.endsWith("a") ? "a" : "o"} {guest.fullName}
          </p>
        )}
        <h1 className="mt-6 text-6xl md:text-7xl" style={{ fontFamily: `"${fontHeading}", serif` }}>
          {event.title}
        </h1>
        {event.eventDate && (
          <p className="mt-6 text-sm uppercase tracking-[0.3em] opacity-60">{event.eventDate}</p>
        )}
        {event.eventDate && (
          <AddToCalendarButton
            title={event.title}
            eventDate={event.eventDate}
            eventTime={event.eventTime}
            location={event.ceremonyLocationName}
          />
        )}
        {guest?.tableName && (
          <p className="mt-4 text-sm opacity-60">Tu mesa: {guest.tableName}</p>
        )}
      </section>

      {enabledKeys.has("countdown") && event.eventDate && <CountdownSection targetDate={event.eventDate} />}
      {enabledKeys.has("story") && event.storyText && <StorySection text={event.storyText} />}
      {enabledKeys.has("agenda") && <AgendaSection items={content.agenda} />}
      {enabledKeys.has("dress_code") && content.dressCodeConfig && (
        <DressCodeSection config={content.dressCodeConfig} />
      )}
      {enabledKeys.has("hotels") && <HotelsSection items={content.hotelsList} />}
      {enabledKeys.has("transport") && <TransportSection items={content.transport} />}
      {enabledKeys.has("gifts") && <GiftsSection items={content.gifts} />}
      {enabledKeys.has("music") && (
        <MusicSection eventSlug={event.slug} guestSlug={guest?.uniqueSlug} approvedSongs={content.songs} />
      )}
      {enabledKeys.has("album") && (
        <AlbumSection eventSlug={event.slug} guestSlug={guest?.uniqueSlug} approvedPhotos={content.albumPhotos} />
      )}
      {enabledKeys.has("rsvp") &&
        (guest ? (
          <RsvpSection guestSlug={guest.uniqueSlug} config={content.rsvpConfig ?? undefined} />
        ) : (
          <GuestLookupSection eventSlug={event.slug} />
        ))}
      {enabledKeys.has("faq") && <FaqSection items={content.faqs} />}
      {event.closingMessage && <ClosingMessageSection text={event.closingMessage} />}
    </main>
  );
}
