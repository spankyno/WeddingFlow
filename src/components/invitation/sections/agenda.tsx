export function AgendaSection({ items }: { items: any[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">Agenda</p>
      <div className="mt-10 space-y-8">
        {items.map((item) => (
          <div key={item.id} className="flex gap-6 border-l border-current/20 pl-6">
            <div className="w-16 shrink-0 text-sm opacity-60">{item.time}</div>
            <div>
              <p className="text-xl">{item.title}</p>
              {item.location && <p className="text-sm opacity-60">{item.location}</p>}
              {item.description && <p className="mt-1 text-sm opacity-70">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
