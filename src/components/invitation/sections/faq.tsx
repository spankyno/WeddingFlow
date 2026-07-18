export function FaqSection({ items }: { items: any[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-xl px-6 py-24">
      <p className="text-center text-xs uppercase tracking-[0.35em] opacity-60">
        Preguntas frecuentes
      </p>
      <div className="mt-10 space-y-6">
        {items.map((faq) => (
          <div key={faq.id} className="border-b border-current/10 pb-6 last:border-0">
            <p className="text-lg">{faq.question}</p>
            <p className="mt-2 text-sm opacity-70">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
