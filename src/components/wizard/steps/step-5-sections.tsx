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

type StyleOverrides = { colorBackground?: string; colorText?: string };
type SectionRow = {
  sectionKey: keyof typeof SECTION_LABELS;
  isEnabled: boolean;
  sortOrder: number;
  styleOverrides: StyleOverrides;
};

function parseOverrides(raw: unknown): StyleOverrides {
  if (typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function Step5Sections({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useSections(eventId);
  const { mutateAsync, isPending } = useUpdateSections(eventId);
  const [rows, setRows] = useState<SectionRow[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (data?.items) {
      setRows(
        [...data.items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            sectionKey: s.sectionKey,
            isEnabled: s.isEnabled,
            sortOrder: s.sortOrder,
            styleOverrides: parseOverrides(s.styleOverrides),
          }))
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

  function updateOverride(key: string, field: keyof StyleOverrides, value: string) {
    setRows((prev) =>
      prev
        ? prev.map((r) =>
            r.sectionKey === key
              ? { ...r, styleOverrides: { ...r.styleOverrides, [field]: value } }
              : r
          )
        : prev
    );
  }

  function clearOverride(key: string) {
    setRows((prev) =>
      prev ? prev.map((r) => (r.sectionKey === key ? { ...r, styleOverrides: {} } : r)) : prev
    );
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
        Activa las secciones que quieras mostrar, ordénalas con las flechas, y personaliza el
        color de fondo/texto de cada una si quieres que destaque sobre el resto.
      </p>
      <div className="space-y-2">
        {rows.map((row, index) => {
          const hasOverride = Boolean(row.styleOverrides.colorBackground || row.styleOverrides.colorText);
          return (
            <div key={row.sectionKey} className="rounded-sm border border-ink/10">
              <div className="flex items-center justify-between px-4 py-3">
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
                  {hasOverride && <span className="h-2 w-2 rounded-full bg-gold-dark" title="Personalizada" />}
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpanded(expanded === row.sectionKey ? null : row.sectionKey)}
                    className="mr-2 text-xs text-gold-dark hover:underline"
                  >
                    {expanded === row.sectionKey ? "Cerrar" : "Personalizar"}
                  </button>
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

              {expanded === row.sectionKey && (
                <div className="border-t border-ink/10 bg-ink/[0.02] px-4 py-4">
                  <div className="flex flex-wrap items-end gap-6">
                    <div>
                      <label className="text-xs text-ink/50">Fondo de esta sección</label>
                      <input
                        type="color"
                        value={row.styleOverrides.colorBackground ?? "#ffffff"}
                        onChange={(e) => updateOverride(row.sectionKey, "colorBackground", e.target.value)}
                        className="mt-1 block h-9 w-16 cursor-pointer rounded border border-ink/15 bg-transparent p-0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink/50">Color del texto</label>
                      <input
                        type="color"
                        value={row.styleOverrides.colorText ?? "#1c1c1c"}
                        onChange={(e) => updateOverride(row.sectionKey, "colorText", e.target.value)}
                        className="mt-1 block h-9 w-16 cursor-pointer rounded border border-ink/15 bg-transparent p-0"
                      />
                    </div>
                    {hasOverride && (
                      <button
                        onClick={() => clearOverride(row.sectionKey)}
                        className="text-xs text-ink/40 hover:text-red-600"
                      >
                        Quitar personalización
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-ink/40">
                    Si no tocas esto, la sección hereda automáticamente los colores del tema
                    general (paso 3).
                  </p>
                </div>
              )}
            </div>
          );
        })}
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
