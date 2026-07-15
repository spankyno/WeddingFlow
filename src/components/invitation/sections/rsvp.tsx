"use client";

import { useState } from "react";

export function RsvpSection({ eventSlug }: { eventSlug: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);

    // guestSlug real vendría de la URL /i/[eventSlug]/[guestSlug]; aquí se ilustra
    // el flujo genérico contra el endpoint /api/rsvp.
    await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestSlug: form.get("guestSlug"),
        willAttend: form.get("willAttend") === "yes",
        companionsCount: Number(form.get("companionsCount") ?? 0),
        message: form.get("message"),
      }),
    });
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-3xl">¡Gracias por confirmar!</p>
        <p className="mt-3 text-ink/60">Os esperamos con muchas ganas.</p>
      </section>
    );
  }

  return (
    <section id="rsvp" className="mx-auto max-w-md px-6 py-24">
      <p className="text-center font-body text-xs uppercase tracking-[0.35em] text-gold-dark">
        Confirmación de asistencia
      </p>
      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <input type="hidden" name="guestSlug" value={eventSlug} />
        <div className="flex justify-center gap-4">
          <label className="flex-1 cursor-pointer rounded-sm border border-ink/20 p-4 text-center has-[:checked]:border-gold-dark has-[:checked]:bg-ink has-[:checked]:text-parchment">
            <input type="radio" name="willAttend" value="yes" className="sr-only" required />
            Asistiré
          </label>
          <label className="flex-1 cursor-pointer rounded-sm border border-ink/20 p-4 text-center has-[:checked]:border-gold-dark has-[:checked]:bg-ink has-[:checked]:text-parchment">
            <input type="radio" name="willAttend" value="no" className="sr-only" required />
            No podré ir
          </label>
        </div>
        <input
          name="companionsCount"
          type="number"
          min={0}
          placeholder="Nº de acompañantes"
          className="w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
        />
        <textarea
          name="message"
          placeholder="Mensaje para los novios (opcional)"
          rows={3}
          className="w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {status === "sending" ? "Enviando…" : "Confirmar"}
        </button>
      </form>
    </section>
  );
}
