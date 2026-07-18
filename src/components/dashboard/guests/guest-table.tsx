"use client";

import { useState } from "react";
import { useUpdateGuest, useDeleteGuest } from "@/hooks/use-guests";
import { GuestInviteDialog } from "@/components/dashboard/guests/guest-invite-dialog";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "Rechazado",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-ink/10 text-ink/60",
  confirmed: "bg-sage/20 text-sage",
  declined: "bg-red-100 text-red-700",
};

export function GuestTable({
  eventId,
  eventSlug,
  guests,
}: {
  eventId: string;
  eventSlug: string;
  guests: any[];
}) {
  const { mutate: updateGuest } = useUpdateGuest(eventId);
  const { mutate: deleteGuest } = useDeleteGuest(eventId);
  const [inviteGuest, setInviteGuest] = useState<{ fullName: string; uniqueSlug: string } | null>(null);

  if (guests.length === 0) {
    return (
      <div className="mt-10 rounded-sm border border-dashed border-ink/20 px-8 py-16 text-center text-ink/60">
        Todavía no hay invitados. Añade el primero o importa un Excel.
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 overflow-x-auto rounded-sm border border-ink/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-ink/[0.03] font-body text-xs uppercase tracking-widest text-ink/50">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Acompañantes</th>
              <th className="px-4 py-3">Etiquetas</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-display text-base">{guest.fullName}</td>
                <td className="px-4 py-3 text-ink/60">
                  {guest.email && <div>{guest.email}</div>}
                  {guest.phone && <div>{guest.phone}</div>}
                  {!guest.email && !guest.phone && "—"}
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {guest.rsvpCompanionsCount ?? 0} / {guest.maxCompanions}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {guest.isVip && (
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold-dark">
                        VIP
                      </span>
                    )}
                    {guest.isChild && (
                      <span className="rounded-full bg-blush/40 px-2 py-0.5 text-xs text-ink/70">
                        Niño
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={guest.rsvpStatus}
                    onChange={(e) =>
                      updateGuest({ guestId: guest.id, input: { rsvpStatus: e.target.value as any } })
                    }
                    className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${STATUS_STYLE[guest.rsvpStatus]}`}
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setInviteGuest({ fullName: guest.fullName, uniqueSlug: guest.uniqueSlug })}
                    className="text-xs text-gold-dark hover:underline"
                  >
                    Invitar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${guest.fullName}?`)) deleteGuest(guest.id);
                    }}
                    className="ml-3 text-xs text-ink/40 transition-colors hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GuestInviteDialog
        eventSlug={eventSlug}
        guest={inviteGuest}
        open={inviteGuest !== null}
        onClose={() => setInviteGuest(null)}
      />
    </>
  );
}
