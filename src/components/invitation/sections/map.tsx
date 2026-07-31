export function MapSection({
  ceremonyLocationName,
  celebrationLocationName,
}: {
  ceremonyLocationName?: string | null;
  celebrationLocationName?: string | null;
}) {
  const locations = [
    { label: "Ceremonia", name: ceremonyLocationName },
    { label: "Celebración", name: celebrationLocationName },
  ].filter((l): l is { label: string; name: string } => Boolean(l.name));

  // Evita duplicar el mapa si ceremonia y celebración son el mismo sitio
  const unique = locations.filter(
    (l, i, arr) => arr.findIndex((x) => x.name === l.name) === i
  );

  if (unique.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">Cómo llegar</p>
      <div className="mt-8 space-y-8">
        {unique.map((loc) => (
          <div key={loc.name}>
            <p className="mb-2 text-center text-sm opacity-70">
              {loc.label} — {loc.name}
            </p>
            <div className="aspect-video w-full overflow-hidden rounded-sm border border-current/10">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(loc.name)}&output=embed`}
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
