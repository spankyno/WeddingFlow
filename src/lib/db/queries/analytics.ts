import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { analyticsEvents } from "@drizzle/schema";
import { nanoid } from "@/lib/utils";
import { getGuestStats } from "@/lib/db/queries/guests";

function detectDeviceType(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

/** Registra una visita a la invitación pública. Best-effort: nunca debe romper el render. */
export async function recordVisit(eventId: string, userAgent: string | null, referrer: string | null) {
  try {
    const db = getDb();
    await db.insert(analyticsEvents).values({
      id: nanoid(),
      eventId,
      type: "visit",
      deviceType: detectDeviceType(userAgent),
      referrer: referrer || null,
    });
  } catch (err) {
    console.error("Error al registrar visita:", err);
  }
}

export async function getAnalyticsSummary(eventId: string) {
  const db = getDb();
  const all = await db.select().from(analyticsEvents).where(eq(analyticsEvents.eventId, eventId)).all();

  const visits = all.filter((e) => e.type === "visit");

  const deviceBreakdown = visits.reduce<Record<string, number>>((acc, v) => {
    const key = v.deviceType ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  // Visitas por día, últimos 14 días
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = visits.filter((v) => v.createdAt.slice(0, 10) === dateStr).length;
    days.push({ date: dateStr, count });
  }

  const guestStats = await getGuestStats(eventId);

  const clickShare = all.filter((e) => e.type === "click_share").length;
  const downloadPdf = all.filter((e) => e.type === "download_pdf").length;
  const downloadImage = all.filter((e) => e.type === "download_image").length;

  return {
    totalVisits: visits.length,
    visitsByDay: days,
    deviceBreakdown,
    guestStats,
    clickShare,
    downloadPdf,
    downloadImage,
  };
}
