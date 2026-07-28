import { NextResponse } from "next/server";
import {
  getEventsNeedingPreReminder,
  getEventsNeedingThankYou,
  getPendingGuestsWithEmail,
  getConfirmedGuestsWithEmail,
} from "@/lib/db/queries/reminders";
import { sendEmail } from "@/lib/email";
import { rsvpReminderEmail, thankYouEmail } from "@/lib/email-templates";

const DAYS_BEFORE_REMINDER = 7;
const DAYS_AFTER_THANK_YOU = 1;

/**
 * Pensada para ser llamada una vez al día por un cron externo (ver
 * .github/workflows/reminders.yml). No es un Cron Trigger nativo de Cloudflare — evita así
 * tener que personalizar el Worker que genera OpenNext, que no expone un hook oficial para
 * añadir un handler `scheduled` sin arriesgar el resto del despliegue.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }
  if (req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const baseUrl = new URL(req.url).origin;
  let remindersSent = 0;
  let thankYousSent = 0;

  const eventsForReminder = await getEventsNeedingPreReminder(DAYS_BEFORE_REMINDER);
  for (const event of eventsForReminder) {
    const pendingGuests = await getPendingGuestsWithEmail(event.id);
    for (const guest of pendingGuests) {
      const result = await sendEmail({
        to: guest.email!,
        subject: `Recordatorio: confirma tu asistencia a ${event.title}`,
        html: rsvpReminderEmail({
          eventTitle: event.title,
          guestName: guest.fullName,
          invitationUrl: `${baseUrl}/i/${event.slug}/${guest.uniqueSlug}`,
        }),
      });
      if (result.sent) remindersSent++;
    }
  }

  const eventsForThankYou = await getEventsNeedingThankYou(DAYS_AFTER_THANK_YOU);
  for (const event of eventsForThankYou) {
    const confirmedGuests = await getConfirmedGuestsWithEmail(event.id);
    for (const guest of confirmedGuests) {
      const result = await sendEmail({
        to: guest.email!,
        subject: `Gracias por celebrar ${event.title} con nosotros`,
        html: thankYouEmail({ eventTitle: event.title, guestName: guest.fullName }),
      });
      if (result.sent) thankYousSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    eventsChecked: { forReminder: eventsForReminder.length, forThankYou: eventsForThankYou.length },
    remindersSent,
    thankYousSent,
  });
}
