const TYPE_LABELS: Record<string, string> = {
  bus: "Autobús",
  parking: "Parking",
  taxi: "Taxi",
  directions: "Cómo llegar",
};

export function TransportSection({ items }: { items: any[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] opacity-60">Transporte</p>
      <div className="mt-8 space-y-6">
        {items.map((option) => (
          <div key={option.id}>
            <p className="text-lg">{TYPE_LABELS[option.type] ?? option.type}</p>
            {option.description && <p className="mt-1 text-sm opacity-70">{option.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
