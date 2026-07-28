"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { trackEvent } from "@/lib/track";

export function DownloadImageButton({
  eventSlug,
  targetId,
  fileName,
}: {
  eventSlug: string;
  targetId: string;
  fileName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    const node = document.getElementById(targetId);
    if (!node) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${fileName}.png`;
      a.click();
      trackEvent(eventSlug, "download_image");
    } catch {
      // Si falla (p.ej. por una fuente externa que bloquea CORS al capturar el lienzo),
      // simplemente no se descarga nada — no hay nada crítico que romper.
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="rounded-full border border-current/25 px-5 py-2.5 text-xs uppercase tracking-widest opacity-80 transition-opacity hover:opacity-100 disabled:opacity-40"
    >
      {loading ? "Generando…" : "Descargar imagen"}
    </button>
  );
}
