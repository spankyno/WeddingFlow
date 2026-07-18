"use client";

import { use } from "react";
import { useAlbumModeration, useUpdatePhotoStatus, useDeletePhoto } from "@/hooks/use-moderation";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

export default function AlbumModerationPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data, isLoading } = useAlbumModeration(eventId);
  const { mutate: updateStatus } = useUpdatePhotoStatus(eventId);
  const { mutate: deletePhoto } = useDeletePhoto(eventId);

  return (
    <div>
      <h1 className="font-display text-4xl">Álbum</h1>
      <p className="mt-2 text-sm text-ink/60">
        Aprueba las fotos que quieras que aparezcan en la invitación pública.
      </p>

      {!isCloudinaryConfigured() && (
        <div className="mt-6 max-w-xl rounded-sm border border-gold-dark/30 bg-gold/5 px-5 py-4 text-sm text-ink/70">
          El álbum todavía no está configurado: faltan las variables de entorno de
          Cloudinary. Mira las instrucciones en el README del proyecto.
        </div>
      )}

      <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
        {isLoading && <p className="col-span-full text-ink/60">Cargando…</p>}
        {data?.items.map((photo: any) => (
          <div key={photo.id} className="overflow-hidden rounded-sm border border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
            <div className="p-2">
              <p className="text-xs text-ink/40">{photo.status}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {photo.status !== "approved" && (
                  <button
                    onClick={() => updateStatus({ photoId: photo.id, status: "approved" })}
                    className="text-xs text-sage hover:underline"
                  >
                    Aprobar
                  </button>
                )}
                {photo.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus({ photoId: photo.id, status: "rejected" })}
                    className="text-xs text-ink/50 hover:underline"
                  >
                    Rechazar
                  </button>
                )}
                <button onClick={() => deletePhoto(photo.id)} className="text-xs text-ink/40 hover:text-red-600">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        {data?.items.length === 0 && (
          <p className="col-span-full text-sm text-ink/50">Todavía no hay fotos.</p>
        )}
      </div>
    </div>
  );
}
