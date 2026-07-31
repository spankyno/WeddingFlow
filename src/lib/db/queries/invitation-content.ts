import { getThemeForEvent, listSectionsForEvent, getRsvpConfigForEvent } from "@/lib/db/queries/event-config";
import {
  listAgendaItems,
  getDressCodeForEvent,
  listGiftOptions,
  listHotels,
  listTransportOptions,
  listFaqs,
} from "@/lib/db/queries/wizard-extras";
import { listApprovedSongSuggestions } from "@/lib/db/queries/songs";
import { listApprovedAlbumPhotos } from "@/lib/db/queries/album";
import { listEventMedia } from "@/lib/db/queries/event-media";

export async function loadInvitationContent(eventId: string) {
  const [theme, sections, rsvpConfig] = await Promise.all([
    getThemeForEvent(eventId),
    listSectionsForEvent(eventId),
    getRsvpConfigForEvent(eventId),
  ]);

  const enabledKeys = new Set(
    sections
      .filter((s) => s.isEnabled)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => s.sectionKey)
  );

  const sectionStyles: Record<string, { colorBackground?: string; colorText?: string }> = {};
  for (const s of sections) {
    try {
      const parsed = JSON.parse(s.styleOverrides || "{}");
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        sectionStyles[s.sectionKey] = parsed;
      }
    } catch {
      // JSON corrupto o vacío: se ignora, esa sección simplemente hereda el tema global
    }
  }

  // Solo se consulta cada tabla si su sección está activa, para no hacer trabajo de más.
  const [agenda, dressCodeConfig, gifts, hotelsList, transport, faqs, songs, albumPhotos, media] = await Promise.all([
    enabledKeys.has("agenda") ? listAgendaItems(eventId) : Promise.resolve([]),
    enabledKeys.has("dress_code") ? getDressCodeForEvent(eventId) : Promise.resolve(null),
    enabledKeys.has("gifts") ? listGiftOptions(eventId) : Promise.resolve([]),
    enabledKeys.has("hotels") ? listHotels(eventId) : Promise.resolve([]),
    enabledKeys.has("transport") ? listTransportOptions(eventId) : Promise.resolve([]),
    enabledKeys.has("faq") ? listFaqs(eventId) : Promise.resolve([]),
    enabledKeys.has("music") ? listApprovedSongSuggestions(eventId) : Promise.resolve([]),
    enabledKeys.has("album") ? listApprovedAlbumPhotos(eventId) : Promise.resolve([]),
    enabledKeys.has("gallery") || enabledKeys.has("video") ? listEventMedia(eventId) : Promise.resolve([]),
  ]);

  const galleryImages = media.filter((m) => m.type === "image");
  const galleryVideos = media.filter((m) => m.type === "video");

  return {
    theme,
    enabledKeys,
    sectionStyles,
    rsvpConfig,
    agenda,
    dressCodeConfig,
    gifts,
    hotelsList,
    transport,
    faqs,
    songs,
    albumPhotos,
    galleryImages,
    galleryVideos,
  };
}

export type InvitationContent = Awaited<ReturnType<typeof loadInvitationContent>>;
