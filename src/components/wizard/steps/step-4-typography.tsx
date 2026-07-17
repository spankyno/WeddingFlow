"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme, useUpdateTheme } from "@/hooks/use-event-config";
import { CURATED_GOOGLE_FONTS } from "@/lib/theme-presets";

export function Step4Typography({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useTheme(eventId);
  const { mutateAsync, isPending } = useUpdateTheme(eventId);
  const [fontHeading, setFontHeading] = useState("Cormorant Garamond");
  const [fontBody, setFontBody] = useState("Jost");

  useEffect(() => {
    if (data?.theme) {
      setFontHeading(data.theme.fontHeading);
      setFontBody(data.theme.fontBody);
    }
  }, [data]);

  const fontsToLoad = [...new Set([fontHeading, fontBody])];

  async function handleContinue() {
    if (!data?.theme) return;
    await mutateAsync({
      themePreset: data.theme.themePreset,
      colorPrimary: data.theme.colorPrimary,
      colorSecondary: data.theme.colorSecondary,
      colorText: data.theme.colorText,
      colorButton: data.theme.colorButton,
      colorBackground: data.theme.colorBackground,
      fontHeading,
      fontBody,
    });
    router.push(`/eventos/${eventId}/wizard/5`);
  }

  if (isLoading) return <p className="text-ink/60">Cargando…</p>;

  return (
    <div className="max-w-xl">
      {/* Carga las fuentes elegidas solo para previsualizarlas en este paso */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?${fontsToLoad
          .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600`)
          .join("&")}&display=swap`}
      />

      <div>
        <label className="font-body text-xs uppercase tracking-widest text-ink/60">
          Tipografía de títulos
        </label>
        <select
          value={fontHeading}
          onChange={(e) => setFontHeading(e.target.value)}
          className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        >
          {CURATED_GOOGLE_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
        <p className="mt-4 text-4xl" style={{ fontFamily: `"${fontHeading}", serif` }}>
          Laura &amp; Marcos
        </p>
      </div>

      <div className="mt-8">
        <label className="font-body text-xs uppercase tracking-widest text-ink/60">
          Tipografía de texto
        </label>
        <select
          value={fontBody}
          onChange={(e) => setFontBody(e.target.value)}
          className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        >
          {CURATED_GOOGLE_FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
        <p className="mt-4 text-base leading-relaxed" style={{ fontFamily: `"${fontBody}", sans-serif` }}>
          Nos hace muchísima ilusión compartir este día tan especial con las personas que
          más queremos. Gracias por formar parte de nuestra historia.
        </p>
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
