const METHOD_LABELS: Record<string, string> = {
  iban: "IBAN",
  bizum: "Bizum",
  paypal: "PayPal",
  transfer: "Transferencia",
  amazon_list: "Lista de Amazon",
  custom_list: "Lista personalizada",
};

export function GiftsSection({ items }: { items: any[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.35em] opacity-60">Lista de regalos</p>
      <p className="mt-4 text-sm opacity-70">
        Vuestra presencia es el mejor regalo, pero si queréis tener un detalle con
        nosotros, aquí tenéis algunas opciones.
      </p>
      <div className="mt-8 space-y-4">
        {items.map((gift) => (
          <div key={gift.id} className="rounded-sm border border-current/10 p-5">
            <p className="text-lg">
              {METHOD_LABELS[gift.method] ?? gift.method}
              {gift.label && <span className="opacity-60"> · {gift.label}</span>}
            </p>
            {gift.value && <p className="mt-1 text-sm opacity-70">{gift.value}</p>}
            {gift.message && <p className="mt-2 text-sm italic opacity-60">{gift.message}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
