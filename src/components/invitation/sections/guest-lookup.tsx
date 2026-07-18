"use client";

import { useState } from "react";

type Match = { guestSlug: string; fullName: string };

export function GuestLookupSection({ eventSlug }: { eventSlug: string }) {
  const [name, setName] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const res = await fetch("/api/public/guests/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug, fullName: name }),
    });
    const data = (await res.json()) as { matches?: Match[] };
    setMatches(data.matches ?? []);
    setSearched(true);
    setLoading(false);
  }

  return (
    <section id="rsvp" className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] opacity-60">Confirmación de asistencia</p>
      <p className="mt-4 text-sm opacity-70">
        Escribe tu nombre tal y como aparece en la invitación para acceder a tu confirmación
        personalizada.
      </p>

      <form onSubmit={handleSearch} className="mt-8 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre completo"
          className="flex-1 border-b border-current/25 bg-transparent py-3 outline-none"
          required
          minLength={2}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {loading ? "…" : "Buscar"}
        </button>
      </form>

      {searched && matches && matches.length === 0 && (
        <p className="mt-6 text-sm opacity-60">
          No hemos encontrado tu invitación. Prueba con el nombre completo o contacta con los
          novios.
        </p>
      )}

      {matches && matches.length > 0 && (
        <div className="mt-6 space-y-2">
          {matches.map((m) => (
            <a
              key={m.guestSlug}
              href={`/i/${eventSlug}/${m.guestSlug}`}
              className="block rounded-sm border border-current/15 px-4 py-3 hover:border-current/40"
            >
              {m.fullName}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
