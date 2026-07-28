"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { trackEvent } from "@/lib/track";

export function DownloadPdfButton({
  eventSlug,
  title,
  eventDate,
  eventTime,
  location,
  guestName,
  publicPath,
}: {
  eventSlug: string;
  title: string;
  eventDate?: string | null;
  eventTime?: string | null;
  location?: string | null;
  guestName?: string;
  publicPath: string;
}) {
  const [loading, setLoading] = useState(false);

  function handleDownload() {
    setLoading(true);
    const publicUrl = `${window.location.origin}${publicPath}`;
    try {
      const doc = new jsPDF({ unit: "mm", format: "a5" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.setFont("times", "italic");
      doc.setFontSize(11);
      doc.text(title.includes("&") ? "Nos casamos" : "Os esperamos", centerX, 40, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(28);
      doc.text(title, centerX, 55, { align: "center" });

      doc.setDrawColor(182, 146, 79);
      doc.line(centerX - 15, 63, centerX + 15, 63);

      doc.setFontSize(12);
      let y = 75;
      if (eventDate) {
        doc.text(`${eventDate}${eventTime ? " · " + eventTime : ""}`, centerX, y, { align: "center" });
        y += 8;
      }
      if (location) {
        doc.text(location, centerX, y, { align: "center" });
        y += 8;
      }
      if (guestName) {
        y += 6;
        doc.setFont("times", "italic");
        doc.text(`Invitación personal de ${guestName}`, centerX, y, { align: "center" });
        y += 8;
      }

      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("Confirma tu asistencia y consulta todos los detalles en:", centerX, y, { align: "center" });
      y += 6;
      doc.setTextColor(30);
      doc.textWithLink(publicUrl, centerX, y, { align: "center", url: publicUrl });

      doc.save(`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
      trackEvent(eventSlug, "download_pdf");
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
      {loading ? "Generando…" : "Descargar PDF"}
    </button>
  );
}
