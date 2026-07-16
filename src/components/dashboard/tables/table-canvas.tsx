"use client";

import { useMemo, useState } from "react";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useTables } from "@/hooks/use-tables";
import { useGuests, useUpdateGuest } from "@/hooks/use-guests";
import { TableCard } from "./table-card";
import { UnassignedPanel, UNASSIGNED_ZONE_ID } from "./unassigned-panel";
import { GuestChip } from "./guest-chip";
import { AddTableDialog } from "./add-table-dialog";

export function TableCanvas({ eventId }: { eventId: string }) {
  const { data: tablesData, isLoading: tablesLoading } = useTables(eventId);
  const { data: guestsData, isLoading: guestsLoading } = useGuests(eventId);
  const { mutate: updateGuest } = useUpdateGuest(eventId);
  const [addTableOpen, setAddTableOpen] = useState(false);
  const [activeGuest, setActiveGuest] = useState<any | null>(null);

  const guestsByTable = useMemo(() => {
    const map = new Map<string, any[]>();
    map.set(UNASSIGNED_ZONE_ID, []);
    for (const guest of guestsData?.items ?? []) {
      const key = guest.tableId ?? UNASSIGNED_ZONE_ID;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(guest);
    }
    return map;
  }, [guestsData]);

  function handleDragStart(event: DragStartEvent) {
    setActiveGuest(event.active.data.current?.guest ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGuest(null);
    const { active, over } = event;
    if (!over) return;

    const guestId = String(active.id);
    const targetTableId = over.id === UNASSIGNED_ZONE_ID ? null : String(over.id);

    // Evita golpear la API si se suelta sobre la misma zona de origen
    const currentGuest = (guestsData?.items ?? []).find((g) => g.id === guestId);
    if (currentGuest && (currentGuest.tableId ?? null) === targetTableId) return;

    // Aviso amistoso de capacidad — no bloquea, solo informa (la organización real de mesas
    // suele necesitar excepciones puntuales, así que no lo convertimos en un límite duro).
    if (targetTableId) {
      const table = tablesData?.items.find((t) => t.id === targetTableId);
      const currentCount = guestsByTable.get(targetTableId)?.length ?? 0;
      if (table && currentCount >= table.capacity) {
        if (!confirm(`"${table.name}" ya está al completo. ¿Asignar igualmente?`)) return;
      }
    }

    updateGuest({ guestId, input: { tableId: targetTableId } });
  }

  if (tablesLoading || guestsLoading) {
    return <p className="mt-10 text-ink/60">Cargando…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/50">
          Arrastra invitados entre mesas para organizar el plano de mesa.
        </p>
        <button
          onClick={() => setAddTableOpen(true)}
          className="rounded-full bg-ink px-6 py-3 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
        >
          + Añadir mesa
        </button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tablesData?.items.length === 0 && (
              <div className="col-span-full rounded-sm border border-dashed border-ink/20 px-8 py-16 text-center text-ink/60">
                Todavía no hay mesas. Crea la primera para empezar a organizar el plano.
              </div>
            )}
            {tablesData?.items.map((table) => (
              <TableCard
                key={table.id}
                eventId={eventId}
                table={table}
                guests={guestsByTable.get(table.id) ?? []}
              />
            ))}
          </div>

          <UnassignedPanel guests={guestsByTable.get(UNASSIGNED_ZONE_ID) ?? []} />
        </div>

        <DragOverlay>{activeGuest && <GuestChip guest={activeGuest} />}</DragOverlay>
      </DndContext>

      <AddTableDialog eventId={eventId} open={addTableOpen} onClose={() => setAddTableOpen(false)} />
    </div>
  );
}
