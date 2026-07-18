"use client";

import { useState } from "react";
import { uploadImageToCloudinary, isCloudinaryConfigured, CloudinaryNotConfiguredError } from "@/lib/cloudinary";

export function AlbumSection({
  eventSlug,
  guestSlug,
  approvedPhotos,
}: {
  eventSlug: string;
  guestSlug?: string;
  approvedPhotos: any[];
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleFile(file: File) {
    setStatus("uploading");
    setErrorMessage("");
    try {
      const url = await uploadImageToCloudinary(file);
      await fetch("/api/public/album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, url, guestSlug }),
      });
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof CloudinaryNotConfiguredError
          ? "El álbum todavía no está configurado por los novios."
          : "No se ha podido subir la foto. Inténtalo de nuevo."
      );
    }
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] opacity-60">Álbum colaborativo</p>
      <p className="mt-4 text-sm opacity-70">
        Comparte tus fotos del día con nosotros — se revisan antes de aparecer aquí.
      </p>

      {isCloudinaryConfigured() && (
        <label className="mt-8 inline-block cursor-pointer rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-widest text-parchment hover:bg-gold-dark">
          {status === "uploading" ? "Subiendo…" : status === "sent" ? "¡Gracias!" : "Subir foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={status === "uploading"}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      )}
      {status === "error" && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}

      {approvedPhotos.length > 0 && (
        <div className="mt-10 grid grid-cols-3 gap-2">
          {approvedPhotos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="aspect-square w-full rounded-sm object-cover"
            />
          ))}
        </div>
      )}
    </section>
  );
}
