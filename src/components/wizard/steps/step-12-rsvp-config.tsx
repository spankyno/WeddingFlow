"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRsvpConfig, useUpdateRsvpConfig } from "@/hooks/use-event-config";
import type { UpdateRsvpConfigInput } from "@/lib/validators/event";

const FIELDS: { key: keyof UpdateRsvpConfigInput; label: string }[] = [
  { key: "askPhone", label: "Teléfono" },
  { key: "askEmail", label: "Email" },
  { key: "askCompanions", label: "Número de acompañantes" },
  { key: "askDietary", label: "Restricciones alimentarias" },
  { key: "askChildren", label: "Asistencia de niños" },
  { key: "askMessage", label: "Mensaje para los novios" },
];

export function Step12RsvpConfig({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useRsvpConfig(eventId);
  const { mutateAsync, isPending } = useUpdateRsvpConfig(eventId);
  const [values, setValues] = useState<UpdateRsvpConfigInput | null>(null);

  useEffect(() => {
    if (data?.config) {
      setValues({
        askPhone: data.config.askPhone,
        askEmail: data.config.askEmail,
        askCompanions: data.config.askCompanions,
        askDietary: data.config.askDietary,
        askChildren: data.config.askChildren,
        askMessage: data.config.askMessage,
      });
    }
  }, [data]);

  async function handleContinue() {
    if (!values) return;
    await mutateAsync(values);
    router.push(`/eventos/${eventId}/wizard/13`);
  }

  if (isLoading || !values) return <p className="text-ink/60">Cargando…</p>;

  return (
    <div className="max-w-lg">
      <p className="mb-6 text-sm text-ink/50">
        El nombre siempre se pide. Elige qué otros datos quieres recoger al confirmar.
      </p>
      <div className="space-y-2">
        {FIELDS.map((field) => (
          <label
            key={field.key}
            className="flex items-center gap-3 rounded-sm border border-ink/10 px-4 py-3"
          >
            <input
              type="checkbox"
              checked={values[field.key]}
              onChange={() => setValues({ ...values, [field.key]: !values[field.key] })}
              className="accent-gold-dark"
            />
            {field.label}
          </label>
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
