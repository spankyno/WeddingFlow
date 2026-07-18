"use client";

import { useState } from "react";

type RsvpConfig = {
  askPhone: boolean;
  askEmail: boolean;
  askCompanions: boolean;
  askDietary: boolean;
  askChildren: boolean;
  askMessage: boolean;
};

const DEFAULT_CONFIG: RsvpConfig = {
  askPhone: true,
  askEmail: true,
  askCompanions: true,
  askDietary: true,
  askChildren: true,
  askMessage: true,
};

export function RsvpSection({
  guestSlug,
  config = DEFAULT_CONFIG,
}: {
  guestSlug: string;
  config?: RsvpConfig;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);

    const childrenNote = form.get("childrenAttending")
      ? `Asistirán niños: ${form.get("childrenAttending")}`
      : "";
    const message = [form.get("message"), childrenNote].filter(Boolean).join(" — ");

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestSlug,
        willAttend: form.get("willAttend") === "yes",
        companionsCount: Number(form.get("companionsCount") ?? 0),
        dietaryRestrictions: form.get("dietaryRestrictions") || undefined,
        message: message || undefined,
        email: form.get("email") || undefined,
        phone: form.get("phone") || undefined,
      }),
    });

    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-3xl">¡Gracias por confirmar!</p>
        <p className="mt-3 opacity-60">Os esperamos con muchas ganas.</p>
      </section>
    );
  }

  return (
    <section id="rsvp" className="mx-auto max-w-md px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">
        Confirmación de asistencia
      </p>
      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div className="flex justify-center gap-4">
          <label className="flex-1 cursor-pointer rounded-sm border border-current/20 p-4 text-center has-[:checked]:bg-current has-[:checked]:text-white">
            <input type="radio" name="willAttend" value="yes" className="sr-only" required />
            Asistiré
          </label>
          <label className="flex-1 cursor-pointer rounded-sm border border-current/20 p-4 text-center has-[:checked]:bg-current has-[:checked]:text-white">
            <input type="radio" name="willAttend" value="no" className="sr-only" required />
            No podré ir
          </label>
        </div>

        {config.askEmail && (
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border-b border-current/25 bg-transparent py-3 outline-none"
          />
        )}
        {config.askPhone && (
          <input
            name="phone"
            placeholder="Teléfono"
            className="w-full border-b border-current/25 bg-transparent py-3 outline-none"
          />
        )}
        {config.askCompanions && (
          <input
            name="companionsCount"
            type="number"
            min={0}
            placeholder="Nº de acompañantes"
            className="w-full border-b border-current/25 bg-transparent py-3 outline-none"
          />
        )}
        {config.askChildren && (
          <input
            name="childrenAttending"
            placeholder="¿Vendrán niños? (nombres o número, opcional)"
            className="w-full border-b border-current/25 bg-transparent py-3 outline-none"
          />
        )}
        {config.askDietary && (
          <input
            name="dietaryRestrictions"
            placeholder="Restricciones alimentarias (opcional)"
            className="w-full border-b border-current/25 bg-transparent py-3 outline-none"
          />
        )}
        {config.askMessage && (
          <textarea
            name="message"
            placeholder="Mensaje para los novios (opcional)"
            rows={3}
            className="w-full border-b border-current/25 bg-transparent py-3 outline-none"
          />
        )}

        {status === "error" && (
          <p className="text-sm text-red-600">
            No hemos podido guardar tu confirmación. Inténtalo de nuevo en unos segundos.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-ink px-8 py-4 text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {status === "sending" ? "Enviando…" : "Confirmar"}
        </button>
      </form>
    </section>
  );
}
