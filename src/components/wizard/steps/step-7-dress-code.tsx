"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDressCode, useUpdateDressCode } from "@/hooks/use-wizard-extras";

export function Step7DressCode({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useDressCode(eventId);
  const { mutateAsync, isPending } = useUpdateDressCode(eventId);
  const [text, setText] = useState("");
  const [colors, setColors] = useState(["#1c1c1c", "#c9a86a", "#faf8f5"]);

  useEffect(() => {
    if (data?.config) {
      setText(data.config.descriptionText ?? "");
      setColors([
        data.config.color1 ?? "#1c1c1c",
        data.config.color2 ?? "#c9a86a",
        data.config.color3 ?? "#faf8f5",
      ]);
    }
  }, [data]);

  async function handleContinue() {
    await mutateAsync({
      descriptionText: text,
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
    });
    router.push(`/eventos/${eventId}/wizard/8`);
  }

  if (isLoading) return <p className="text-ink/60">Cargando…</p>;

  return (
    <div className="max-w-xl">
      <label className="font-body text-xs uppercase tracking-widest text-ink/60">
        Descripción / inspiración
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Etiqueta: formal. Evitad el blanco y los tonos pastel…"
        className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
      />

      <label className="mt-8 block font-body text-xs uppercase tracking-widest text-ink/60">
        Paleta de colores sugerida
      </label>
      <div className="mt-2 flex gap-3">
        {colors.map((color, i) => (
          <input
            key={i}
            type="color"
            value={color}
            onChange={(e) => {
              const next = [...colors];
              next[i] = e.target.value;
              setColors(next);
            }}
            className="h-12 w-12 cursor-pointer rounded border border-ink/15 bg-transparent p-0"
          />
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
