"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Dialog } from "@/components/ui/dialog";

export function GuestInviteDialog({
  eventSlug,
  guest,
  open,
  onClose,
}: {
  eventSlug: string;
  guest: { fullName: string; uniqueSlug: string } | null;
  open: boolean;
  onClose: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url =
    guest && typeof window !== "undefined"
      ? `${window.location.origin}/i/${eventSlug}/${guest.uniqueSlug}`
      : "";

  useEffect(() => {
    if (guest && url) {
      QRCode.toDataURL(url, { width: 320, margin: 1 }).then(setQrDataUrl);
    } else {
      setQrDataUrl(null);
    }
  }, [guest, url]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!guest) return null;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `¡Hola ${guest.fullName}! Aquí tienes tu invitación: ${url}`
  )}`;
  const mailHref = `mailto:?subject=${encodeURIComponent("Tu invitación")}&body=${encodeURIComponent(url)}`;

  return (
    <Dialog open={open} onClose={onClose} title={`Invitar a ${guest.fullName}`}>
      <div className="flex flex-col items-center gap-6">
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Código QR de la invitación" className="h-48 w-48" />
        )}

        <div className="w-full truncate rounded-sm bg-ink/[0.03] px-4 py-2 text-center text-sm text-ink/60">
          {url}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleCopy}
            className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 hover:border-ink"
          >
            {copied ? "¡Copiado!" : "Copiar enlace"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 hover:border-ink"
          >
            WhatsApp
          </a>
          <a href={mailHref} className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 hover:border-ink">
            Email
          </a>
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`qr-${guest.uniqueSlug}.png`}
              className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 hover:border-ink"
            >
              Descargar QR
            </a>
          )}
        </div>
      </div>
    </Dialog>
  );
}
