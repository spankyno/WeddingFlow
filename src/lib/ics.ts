// Genera un .ics genérico (compatible con Apple Calendar, Google Calendar y Outlook)
// enteramente en el cliente — no hace falta backend ni integraciones OAuth.

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function downloadEventIcs(params: {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string | null; // HH:mm
  durationHours?: number;
}) {
  const { title, description = "", location = "", startDate, startTime, durationHours = 4 } = params;

  const start = new Date(`${startDate}T${startTime || "12:00"}:00`);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WeddingFlow//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@weddingflow`,
    `DTSTAMP:${toIcsDate(new Date())}`,
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

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
