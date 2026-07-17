"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme, useUpdateTheme } from "@/hooks/use-event-config";
import type { ThemeValues } from "@/lib/theme-presets";

const FIELDS: { key: keyof ThemeValues; label: string }[] = [
  { key: "colorPrimary", label: "Color principal" },
  { key: "colorSecondary", label: "Color secundario" },
  { key: "colorText", label: "Texto" },
  { key: "colorButton", label: "Botones" },
  { key: "colorBackground", label: "Fondo" },
];

export function Step3Palette({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useTheme(eventId);
  const { mutateAsync, isPending } = useUpdateTheme(eventId);
  const [values, setValues] = useState<ThemeValues | null>(null);

  useEffect(() => {
    if (data?.theme) {
      setValues({
        colorPrimary: data.theme.colorPrimary,
        colorSecondary: data.theme.colorSecondary,
        colorText: data.theme.colorText,
        colorButton: data.theme.colorButton,
        colorBackground: data.theme.colorBackground,
        fontHeading: data.theme.fontHeading,
        fontBody: data.theme.fontBody,
      });
    }
  }, [data]);

  async function handleContinue() {
    if (!values || !data?.theme) return;
    await mutateAsync({ themePreset: data.theme.themePreset, ...values });
    router.push(`/eventos/${eventId}/wizard/4`);
  }

  if (isLoading || !values) return <p className="text-ink/60">Cargando…</p>;

  return (
    <div className="max-w-xl">
      <div className="grid grid-cols-2 gap-6">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="font-body text-xs uppercase tracking-widest text-ink/60">
              {field.label}
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded border border-ink/15 bg-transparent p-0"
              />
              <input
                type="text"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className="w-24 border-b border-ink/25 bg-transparent py-1 text-sm outline-none focus:border-gold-dark"
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-10 rounded-sm border border-ink/10 p-8 text-center"
        style={{ backgroundColor: values.colorBackground, color: values.colorText }}
      >
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: values.colorSecondary }}>
          Vista previa
        </p>
        <p className="mt-3 text-2xl" style={{ fontFamily: "serif" }}>
          Laura &amp; Marcos
        </p>
        <button
          className="mt-5 rounded-full px-6 py-2 text-sm text-white"
          style={{ backgroundColor: values.colorButton }}
        >
          Confirmar asistencia
        </button>
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
