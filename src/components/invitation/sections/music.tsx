"use client";

import { useState } from "react";

export function MusicSection({
  eventSlug,
  guestSlug,
  approvedSongs,
}: {
  eventSlug: string;
  guestSlug?: string;
  approvedSongs: any[];
}) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await fetch("/api/public/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug, title, artist, guestSlug }),
    });
    setTitle("");
    setArtist("");
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] opacity-60">Música</p>
      <p className="mt-4 text-sm opacity-70">
        Ayúdanos a montar la playlist de la fiesta — sugiere una canción que no puede faltar.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la canción"
          required
          className="flex-1 border-b border-current/25 bg-transparent py-3 outline-none"
        />
        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artista (opcional)"
          className="flex-1 border-b border-current/25 bg-transparent py-3 outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {status === "sending" ? "…" : status === "sent" ? "¡Gracias!" : "Sugerir"}
        </button>
      </form>

      {approvedSongs.length > 0 && (
        <div className="mt-10 text-left">
          <p className="text-xs uppercase tracking-widest opacity-50">Ya en la lista</p>
          <ul className="mt-3 space-y-1 text-sm opacity-70">
            {approvedSongs.map((song) => (
              <li key={song.id}>
                {song.title} {song.artist && `— ${song.artist}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
