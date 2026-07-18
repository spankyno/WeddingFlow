"use client";

import { use } from "react";
import { useSongsModeration, useUpdateSongStatus, useDeleteSong } from "@/hooks/use-moderation";

const STATUS_LABEL: Record<string, string> = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" };

export default function MusicModerationPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data, isLoading } = useSongsModeration(eventId);
  const { mutate: updateStatus } = useUpdateSongStatus(eventId);
  const { mutate: deleteSong } = useDeleteSong(eventId);

  return (
    <div>
      <h1 className="font-display text-4xl">Música</h1>
      <p className="mt-2 text-sm text-ink/60">
        Aprueba las canciones que quieras que aparezcan en la invitación pública.
      </p>

      <div className="mt-8 max-w-xl space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((song: any) => (
          <div key={song.id} className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3">
            <div>
              <p className="font-display text-lg">
                {song.title} {song.artist && <span className="text-sm text-ink/50">— {song.artist}</span>}
              </p>
              <p className="text-xs text-ink/40">{STATUS_LABEL[song.status]}</p>
            </div>
            <div className="flex gap-2">
              {song.status !== "approved" && (
                <button
                  onClick={() => updateStatus({ songId: song.id, status: "approved" })}
                  className="text-xs text-sage hover:underline"
                >
                  Aprobar
                </button>
              )}
              {song.status !== "rejected" && (
                <button
                  onClick={() => updateStatus({ songId: song.id, status: "rejected" })}
                  className="text-xs text-ink/50 hover:underline"
                >
                  Rechazar
                </button>
              )}
              <button onClick={() => deleteSong(song.id)} className="text-xs text-ink/40 hover:text-red-600">
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {data?.items.length === 0 && (
          <p className="text-sm text-ink/50">Todavía no hay canciones sugeridas.</p>
        )}
      </div>
    </div>
  );
}
