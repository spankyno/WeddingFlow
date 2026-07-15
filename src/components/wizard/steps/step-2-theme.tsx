"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { themePresetEnum } from "@drizzle/schema";

const THEME_LABELS: Record<(typeof themePresetEnum)[number], string> = {
  minimalista: "Minimalista",
  elegante: "Elegante",
  boho: "Boho",
  vintage: "Vintage",
  moderno: "Moderno",
  luxury: "Luxury",
  floral: "Floral",
  playa: "Playa",
  invierno: "Invierno",
  personalizado: "Personalizado",
};

export function Step2Theme({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof themePresetEnum)[number]>("elegante");
  const [isSaving, setIsSaving] = useState(false);

  async function handleContinue() {
    setIsSaving(true);
    await fetch(`/api/events/${eventId}/theme`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themePreset: selected }),
    });
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
          >
            <span className="font-display text-lg">{THEME_LABELS[preset]}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={isSaving}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
      >
        {isSaving ? "Guardando…" : "Continuar"}
      </button>
    </div>
  );
}
