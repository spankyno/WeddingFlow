"use client";

export function trackEvent(eventSlug: string, type: "click_share" | "download_pdf" | "download_image") {
  // Fire-and-forget: no se espera la respuesta ni se bloquea la acción del usuario por esto.
  fetch("/api/public/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventSlug, type }),
  }).catch(() => {
    /* no pasa nada si falla, es solo analítica */
  });
}
