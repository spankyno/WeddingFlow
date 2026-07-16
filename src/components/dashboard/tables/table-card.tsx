"use client";

import { useDroppable } from "@dnd-kit/core";
import { GuestChip } from "./guest-chip";
import { useDeleteTable } from "@/hooks/use-tables";

export function TableCard({
  eventId,
  table,
  guests,
}: {
  eventId: string;
  table: any;
  guests: any[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: table.id });
  const { mutate: deleteTable } = useDeleteTable(eventId);
  const isFull = guests.length >= table.capacity;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[220px] flex-col rounded-sm border p-4 transition-colors ${
        isOver ? "border-gold-dark bg-gold/5" : "border-ink/15"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: table.color }} />
            <h3 className="font-display text-xl">{table.name}</h3>
          </div>
          <p className={`text-xs ${isFull ? "text-red-600" : "text-ink/50"}`}>
            {guests.length} / {table.capacity} sitios
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm(`¿Eliminar "${table.name}"? Los invitados quedarán sin mesa.`)) {
              deleteTable(table.id);
            }
          }}
          className="text-xs text-ink/40 transition-colors hover:text-red-600"
        >
          Eliminar
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {guests.map((guest) => (
          <GuestChip key={guest.id} guest={guest} />
        ))}
        {guests.length === 0 && (
          <p className="flex flex-1 items-center justify-center text-xs text-ink/30">
            Arrastra invitados aquí
          </p>
        )}
      </div>
    </div>
  );
}
