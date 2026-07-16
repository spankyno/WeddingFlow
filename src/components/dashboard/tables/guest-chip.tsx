"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export function GuestChip({ guest }: { guest: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex cursor-grab items-center justify-between gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2 text-sm active:cursor-grabbing"
    >
      <span className="truncate">{guest.fullName}</span>
      {guest.isVip && <span className="text-xs text-gold-dark">VIP</span>}
    </div>
  );
}
