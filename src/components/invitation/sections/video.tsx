function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoSection({ items }: { items: { id: string; url: string }[] }) {
  const embeddable = items.map((item) => ({ ...item, embedUrl: getEmbedUrl(item.url) })).filter((i) => i.embedUrl);
  if (embeddable.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">Vídeo</p>
      <div className="mt-8 space-y-6">
        {embeddable.map((item) => (
          <div key={item.id} className="aspect-video w-full overflow-hidden rounded-sm">
            <iframe
              src={item.embedUrl!}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </section>
  );
}
