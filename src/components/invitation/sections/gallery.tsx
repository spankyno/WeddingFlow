export function GallerySection({ items }: { items: { id: string; url: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">Galería</p>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="aspect-square w-full rounded-sm object-cover" />
          </a>
        ))}
      </div>
    </section>
  );
}
