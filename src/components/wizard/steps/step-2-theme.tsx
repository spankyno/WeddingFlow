"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { themePresetEnum } from "@drizzle/schema";
import { THEME_LABELS, THEME_PRESET_DEFAULTS, type ThemePreset } from "@/lib/theme-presets";
import { useUpdateTheme } from "@/hooks/use-event-config";

export function Step2Theme({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ThemePreset>("elegante");
  const { mutateAsync, isPending } = useUpdateTheme(eventId);

  async function handleContinue() {
    await mutateAsync({ themePreset: selected, ...THEME_PRESET_DEFAULTS[selected] });
    router.push(`/eventos/${eventId}/wizard/3`);
  }

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {themePresetEnum.map((preset) => (
          <button
            key={preset}
            onClick={() => setSelected(preset)}
            className={`aspect-[3/4] rounded-sm border p-4 text-left transition-colors ${
              selected === preset
                ? "border-gold-dark bg-ink text-parchment"
                : "border-ink/15 hover:border-gold-dark/60"
            }`}
            style={
              selected !== preset
                ? { backgroundColor: THEME_PRESET_DEFAULTS[preset].colorBackground }
                : undefined
            }
          >
            <span
              className="font-display text-lg"
              style={{
                fontFamily: `"${THEME_PRESET_DEFAULTS[preset].fontHeading}", serif`,
                color: selected === preset ? undefined : THEME_PRESET_DEFAULTS[preset].colorPrimary,
              }}
            >
              {THEME_LABELS[preset]}
            </span>
          </button>
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
