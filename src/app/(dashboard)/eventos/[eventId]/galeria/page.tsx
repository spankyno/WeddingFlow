"use client";

import { use, useState } from "react";
import { useEventMedia, useAddEventMedia, useDeleteEventMedia } from "@/hooks/use-event-media";
import { uploadImageToCloudinary, isCloudinaryConfigured, CloudinaryNotConfiguredError } from "@/lib/cloudinary";

export default function GalleryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data, isLoading } = useEventMedia(eventId);
  const { mutateAsync: addMedia, isPending: isAdding } = useAddEventMedia(eventId);
  const { mutate: deleteMedia } = useDeleteEventMedia(eventId);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const images = data?.items.filter((m: any) => m.type === "image") ?? [];
  const videos = data?.items.filter((m: any) => m.type === "video") ?? [];

  async function handleUploadPhotos(files: FileList) {
    setUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImageToCloudinary(file);
        await addMedia({ type: "image", url });
      }
    } catch (err) {
      setUploadError(
        err instanceof CloudinaryNotConfiguredError
          ? "Configura Cloudinary primero (ver README) para poder subir fotos."
          : "No se han podido subir algunas fotos."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    await addMedia({ type: "video", url: videoUrl.trim() });
    setVideoUrl("");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Galería</h1>
      <p className="mt-2 max-w-lg text-sm text-ink/60">
        Las fotos y el vídeo que subas aquí aparecen en la sección "Galería"/"Vídeo" de la
        invitación pública, si están activadas en el paso 5 del wizard.
      </p>

      <div className="mt-8">
        <p className="font-body text-xs uppercase tracking-widest text-ink/50">Fotos</p>
        {!isCloudinaryConfigured() && (
          <div className="mt-3 max-w-lg rounded-sm border border-gold-dark/30 bg-gold/5 px-5 py-4 text-sm text-ink/70">
            Falta configurar Cloudinary (ver README) para poder subir fotos.
          </div>
        )}
        {isCloudinaryConfigured() && (
          <label className="mt-3 inline-block cursor-pointer rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark">
            {uploading ? "Subiendo…" : "+ Subir fotos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files && handleUploadPhotos(e.target.files)}
            />
          </label>
        )}
        {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img: any) => (
            <div key={img.id} className="group relative overflow-hidden rounded-sm border border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="aspect-square w-full object-cover" />
              <button
                onClick={() => deleteMedia(img.id)}
                className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 py-0.5 text-xs text-parchment opacity-0 transition-opacity group-hover:opacity-100"
              >
                Eliminar
              </button>
            </div>
          ))}
          {!isLoading && images.length === 0 && (
            <p className="col-span-full text-sm text-ink/50">Todavía no hay fotos.</p>
          )}
        </div>
      </div>

      <div className="mt-10 max-w-lg">
        <p className="font-body text-xs uppercase tracking-widest text-ink/50">
          Vídeo (YouTube o Vimeo)
        </p>
        <form onSubmit={handleAddVideo} className="mt-3 flex gap-2">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 border-b border-ink/25 bg-transparent py-2 text-sm outline-none focus:border-gold-dark"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="rounded-full bg-ink px-5 py-2 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
          >
            Añadir
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {videos.map((video: any) => (
            <div key={video.id} className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-2 text-sm">
              <span className="truncate">{video.url}</span>
              <button onClick={() => deleteMedia(video.id)} className="ml-3 shrink-0 text-xs text-ink/40 hover:text-red-600">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
