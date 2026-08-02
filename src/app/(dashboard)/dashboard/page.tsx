"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useEvents } from "@/hooks/use-events";
import { useOrganizations } from "@/hooks/use-organizations";

function EventCard({ event }: { event: any }) {
  return (
    <Link
      href={`/eventos/${event.id}`}
      className="block rounded-sm border border-ink/15 p-6 transition-colors hover:border-gold-dark"
    >
      <p className="font-body text-xs uppercase tracking-widest text-gold-dark">{event.eventType}</p>
      <h3 className="mt-2 font-display text-2xl">{event.title}</h3>
      <p className="mt-1 text-sm text-ink/60">{event.eventDate ?? "Fecha por definir"}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useEvents();
  const { data: orgsData } = useOrganizations();

  const hasOrganizations = (orgsData?.items.length ?? 0) > 0;

  const grouped = useMemo(() => {
    if (!data?.items || !hasOrganizations) return null;
    const byOrg = new Map<string, any[]>();
    const unassigned: any[] = [];
    for (const event of data.items) {
      if (event.organizationId) {
        if (!byOrg.has(event.organizationId)) byOrg.set(event.organizationId, []);
        byOrg.get(event.organizationId)!.push(event);
      } else {
        unassigned.push(event);
      }
    }
    return { byOrg, unassigned };
  }, [data, hasOrganizations]);

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

      {/* Sin organizaciones creadas: listado plano, como siempre */}
      {!grouped && (
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {data?.items?.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Con organizaciones: agrupado por cliente */}
      {grouped && (
        <div className="mt-10 space-y-10">
          {orgsData?.items.map((org: any) => {
            const orgEvents = grouped.byOrg.get(org.id) ?? [];
            if (orgEvents.length === 0) return null;
            return (
              <div key={org.id}>
                <p className="font-body text-xs uppercase tracking-widest text-ink/50">{org.name}</p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {orgEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            );
          })}

          {grouped.unassigned.length > 0 && (
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-ink/50">
                Sin organización
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {grouped.unassigned.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
