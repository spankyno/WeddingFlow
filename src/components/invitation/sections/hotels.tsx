export function HotelsSection({ items }: { items: any[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">
        Dónde alojarse
      </p>
      <div className="mt-10 space-y-6">
        {items.map((hotel) => (
          <div key={hotel.id} className="rounded-sm border border-current/10 p-5">
            <p className="text-lg">{hotel.name}</p>
            {hotel.address && <p className="text-sm opacity-60">{hotel.address}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 text-sm opacity-70">
              {hotel.priceHint && <span>{hotel.priceHint}</span>}
              {hotel.phone && <span>{hotel.phone}</span>}
              {hotel.websiteUrl && (
                <a href={hotel.websiteUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Web
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
