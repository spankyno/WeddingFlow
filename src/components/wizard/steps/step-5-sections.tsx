"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSections, useUpdateSections } from "@/hooks/use-event-config";
import type { sectionKeyEnum } from "@drizzle/schema";

const SECTION_LABELS: Record<(typeof sectionKeyEnum)[number], string> = {
  story: "Nuestra historia",
  countdown: "Cuenta atrás",
  gallery: "Galería",
  video: "Vídeo",
  map: "Mapa",
  agenda: "Agenda",
  dress_code: "Dress code",
  gifts: "Lista de regalos",
  rsvp: "Confirmación de asistencia",
  hotels: "Hoteles",
  transport: "Transporte",
  faq: "Preguntas frecuentes",
  contact: "Contacto",
  music: "Música",
  album: "Álbum colaborativo",
};

type SectionRow = { sectionKey: keyof typeof SECTION_LABELS; isEnabled: boolean; sortOrder: number };

export function Step5Sections({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useSections(eventId);
  const { mutateAsync, isPending } = useUpdateSections(eventId);
  const [rows, setRows] = useState<SectionRow[] | null>(null);

  useEffect(() => {
    if (data?.items) {
      setRows(
        [...data.items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({ sectionKey: s.sectionKey, isEnabled: s.isEnabled, sortOrder: s.sortOrder }))
      );
    }
  }, [data]);

  function toggle(key: string) {
    setRows((prev) =>
      prev ? prev.map((r) => (r.sectionKey === key ? { ...r, isEnabled: !r.isEnabled } : r)) : prev
    );
  }

  function move(index: number, direction: -1 | 1) {
    setRows((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!];
      return next.map((r, i) => ({ ...r, sortOrder: i }));
    });
  }

  async function handleContinue() {
    if (!rows) return;
    await mutateAsync({ sections: rows });
    router.push(`/eventos/${eventId}/wizard/6`);
  }

  if (isLoading || !rows) return <p className="text-ink/60">Cargando…</p>;

  return (
    <div className="max-w-lg">
      <p className="mb-6 text-sm text-ink/50">
        Activa las secciones que quieras mostrar y ordénalas con las flechas.
      </p>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={row.sectionKey}
            className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={row.isEnabled}
                onChange={() => toggle(row.sectionKey)}
                className="accent-gold-dark"
              />
              <span className={row.isEnabled ? "" : "text-ink/40"}>
                {SECTION_LABELS[row.sectionKey]}
              </span>
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded px-2 py-1 text-ink/40 hover:bg-ink/5 hover:text-ink disabled:opacity-20"
              >
                ↑
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                className="rounded px-2 py-1 text-ink/40 hover:bg-ink/5 hover:text-ink disabled:opacity-20"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={isPending}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Continuar"}
      </button>
    </div>
  );
}
