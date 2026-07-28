"use client";

import { downloadEventIcs } from "@/lib/ics";

export function AddToCalendarButton({
  title,
  eventDate,
  eventTime,
  location,
}: {
  title: string;
  eventDate: string;
  eventTime?: string | null;
  location?: string | null;
}) {
  return (
    <button
      onClick={() =>
        downloadEventIcs({
          title,
          startDate: eventDate,
          startTime: eventTime,
          location: location || undefined,
          description: `Invitación: ${title}`,
        })
      }
      className="mt-6 rounded-full border border-current/25 px-5 py-2.5 text-xs uppercase tracking-widest opacity-80 transition-opacity hover:opacity-100"
    >
      + Añadir al calendario
    </button>
  );
}
