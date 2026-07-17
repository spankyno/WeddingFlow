"use client";

import { use, useState } from "react";
import { useGuests } from "@/hooks/use-guests";
import { GuestStatsBar } from "@/components/dashboard/guests/guest-stats-bar";
import { GuestTable } from "@/components/dashboard/guests/guest-table";
import { AddGuestDialog } from "@/components/dashboard/guests/add-guest-dialog";
import { ImportExcelDialog } from "@/components/dashboard/guests/import-excel-dialog";

export default function GuestsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data, isLoading } = useGuests(eventId);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Invitados</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setImportOpen(true)}
            className="rounded-full border border-ink/20 px-6 py-3 font-body text-sm uppercase tracking-widest text-ink/70 transition-colors hover:border-ink"
          >
            Importar Excel
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-full bg-ink px-6 py-3 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
          >
            + Añadir invitado
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-10 text-ink/60">Cargando…</p>}

      {data && (
        <>
          <div className="mt-8">
            <GuestStatsBar stats={data.stats} />
          </div>
          <GuestTable eventId={eventId} guests={data.items} />
        </>
      )}

      <AddGuestDialog eventId={eventId} open={addOpen} onClose={() => setAddOpen(false)} />
      <ImportExcelDialog eventId={eventId} open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
