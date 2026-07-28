"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/track";

export function ShareButtons({ eventSlug, title }: { eventSlug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/i/${eventSlug}`);

  useEffect(() => {
    setUrl(`${window.location.origin}/i/${eventSlug}`);
  }, [eventSlug]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    trackEvent(eventSlug, "click_share");
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleCopy}
        className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-ink"
      >
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(eventSlug, "click_share")}
        className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-ink"
      >
        WhatsApp
      </a>
      <a
        href={mailHref}
        onClick={() => trackEvent(eventSlug, "click_share")}
        className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-ink"
      >
        Email
      </a>
    </div>
  );
}
