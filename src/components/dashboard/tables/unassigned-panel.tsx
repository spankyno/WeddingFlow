"use client";

import { useDroppable } from "@dnd-kit/core";
import { GuestChip } from "./guest-chip";

export const UNASSIGNED_ZONE_ID = "unassigned";

export function UnassignedPanel({ guests }: { guests: any[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: UNASSIGNED_ZONE_ID });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[400px] flex-col rounded-sm border p-4 transition-colors ${
        isOver ? "border-gold-dark bg-gold/5" : "border-ink/15 border-dashed"
      }`}
    >
      <h3 className="font-display text-xl">Sin mesa asignada</h3>
      <p className="text-xs text-ink/50">{guests.length} invitados</p>

      <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
        {guests.map((guest) => (
          <GuestChip key={guest.id} guest={guest} />
        ))}
        {guests.length === 0 && (
          <p className="mt-8 text-center text-xs text-ink/30">Todo el mundo tiene mesa 🎉</p>
        )}
      </div>
    </div>
  );
}
