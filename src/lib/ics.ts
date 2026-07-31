// Genera un .ics genérico (compatible con Apple Calendar, Google Calendar y Outlook)
// enteramente en el cliente — no hace falta backend ni integraciones OAuth.

export function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export type IcsEventParams = {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string | null; // HH:mm
  durationHours?: number;
  uid?: string; // inyectable para tests deterministas; si no se pasa, se genera uno
  now?: Date; // inyectable para tests deterministas; por defecto, la hora actual
};

/** Construye el contenido textual del .ics. Función pura, sin tocar el DOM — testable. */
export function buildIcsContent(params: IcsEventParams): string {
  const {
    title,
    description = "",
    location = "",
    startDate,
    startTime,
    durationHours = 4,
    uid = crypto.randomUUID(),
    now = new Date(),
  } = params;

  const start = new Date(`${startDate}T${startTime || "12:00"}:00`);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WeddingFlow//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}@weddingflow`,
    `DTSTAMP:${toIcsDate(now)}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title.replace(/\n/g, " ")}`,
    description && `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    location && `LOCATION:${location.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadEventIcs(params: IcsEventParams) {
  const ics = buildIcsContent(params);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${params.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
