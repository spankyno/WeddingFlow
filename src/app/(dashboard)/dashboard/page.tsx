"use client";

import Link from "next/link";
import { useEvents } from "@/hooks/use-events";

export default function DashboardPage() {
  const { data, isLoading } = useEvents();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Vuestros eventos</h1>
        <Link
          href="/eventos/nuevo"
          className="rounded-full bg-ink px-6 py-3 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
        >
          + Crear evento
        </Link>
      </div>

      {isLoading && <p className="mt-10 text-ink/60">Cargando…</p>}

      {!isLoading && data?.items?.length === 0 && (
        <div className="mt-16 rounded-sm border border-dashed border-ink/20 px-8 py-20 text-center">
          <p className="font-display text-2xl">Aún no tenéis ningún evento</p>
          <p className="mt-2 text-ink/60">Empezad creando vuestra primera invitación.</p>
          <Link
            href="/eventos/nuevo"
            className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-body text-sm uppercase tracking-widest text-parchment"
          >
            Crear mi primer evento
          </Link>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {data?.items?.map((event: any) => (
          <Link
            key={event.id}
            href={`/eventos/${event.id}`}
            className="block rounded-sm border border-ink/15 p-6 transition-colors hover:border-gold-dark"
          >
            <p className="font-body text-xs uppercase tracking-widest text-gold-dark">
              {event.eventType}
            </p>
            <h3 className="mt-2 font-display text-2xl">{event.title}</h3>
            <p className="mt-1 text-sm text-ink/60">{event.eventDate ?? "Fecha por definir"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
