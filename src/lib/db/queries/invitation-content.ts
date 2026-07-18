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

  // Solo se consulta cada tabla si su sección está activa, para no hacer trabajo de más.
  const [agenda, dressCodeConfig, gifts, hotelsList, transport, faqs, songs, albumPhotos] = await Promise.all([
    enabledKeys.has("agenda") ? listAgendaItems(eventId) : Promise.resolve([]),
    enabledKeys.has("dress_code") ? getDressCodeForEvent(eventId) : Promise.resolve(null),
    enabledKeys.has("gifts") ? listGiftOptions(eventId) : Promise.resolve([]),
    enabledKeys.has("hotels") ? listHotels(eventId) : Promise.resolve([]),
    enabledKeys.has("transport") ? listTransportOptions(eventId) : Promise.resolve([]),
    enabledKeys.has("faq") ? listFaqs(eventId) : Promise.resolve([]),
    enabledKeys.has("music") ? listApprovedSongSuggestions(eventId) : Promise.resolve([]),
    enabledKeys.has("album") ? listApprovedAlbumPhotos(eventId) : Promise.resolve([]),
  ]);

  return {
    theme,
    enabledKeys,
    rsvpConfig,
    agenda,
    dressCodeConfig,
    gifts,
    hotelsList,
    transport,
    faqs,
    songs,
    albumPhotos,
  };
}

export type InvitationContent = Awaited<ReturnType<typeof loadInvitationContent>>;
