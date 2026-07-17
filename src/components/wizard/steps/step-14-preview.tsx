"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useUpdateEventDetails } from "@/hooks/use-event-config";
import { ShareButtons } from "@/components/dashboard/share-buttons";

export function Step14Preview({ eventId }: { eventId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error("Error al cargar el evento");
      return res.json() as Promise<{ event: any }>;
    },
  });
  const { mutateAsync, isPending } = useUpdateEventDetails(eventId);
  const [published, setPublished] = useState(false);

  async function handlePublish() {
    await mutateAsync({ status: "published" });
    setPublished(true);
  }

  if (isLoading || !data?.event) return <p className="text-ink/60">Cargando…</p>;

  const event = data.event;
  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/i/${event.slug}` : `/i/${event.slug}`;
  const isPublished = published || event.status === "published";

  return (
    <div className="max-w-xl">
      <div className="rounded-sm border border-ink/10 bg-white p-10 text-center shadow-sm">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-gold-dark">
          {event.eventType === "wedding" ? "Nos casamos" : "Os esperamos"}
        </p>
        <h2 className="mt-4 font-display text-4xl">{event.title}</h2>
        {event.eventDate && <p className="mt-3 text-sm text-ink/60">{event.eventDate}</p>}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-sm bg-ink/[0.03] px-5 py-3 text-sm">
        <span className="truncate text-ink/60">{publicUrl}</span>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-gold-dark underline underline-offset-4"
        >
          Ver
        </a>
      </div>

      {!isPublished ? (
        <button
          onClick={handlePublish}
          disabled={isPending}
          className="mt-8 w-full rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {isPending ? "Publicando…" : "Publicar invitación"}
        </button>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-center text-sm text-sage">✓ Invitación publicada</p>
          <ShareButtons eventSlug={event.slug} title={event.title} />
          <Link
            href={`/eventos/${eventId}`}
            className="block text-center text-sm text-ink/50 underline decoration-gold-dark underline-offset-4 hover:text-ink"
          >
            Ir al resumen del evento
          </Link>
        </div>
      )}
    </div>
  );
}
