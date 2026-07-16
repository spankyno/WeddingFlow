export function GuestStatsBar({
  stats,
}: {
  stats: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
    totalConfirmedHeadcount: number;
  };
}) {
  const confirmedPct = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;

  const items = [
    { label: "Invitados", value: stats.total },
    { label: "Confirmados", value: stats.confirmed },
    { label: "Pendientes", value: stats.pending },
    { label: "No asisten", value: stats.declined },
    { label: "Asistentes totales", value: stats.totalConfirmedHeadcount },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-sm border border-ink/10 px-5 py-4">
          <p className="font-display text-3xl">{item.value}</p>
          <p className="mt-1 font-body text-xs uppercase tracking-widest text-ink/50">
            {item.label}
          </p>
        </div>
      ))}
      <div className="col-span-2 flex items-center gap-3 rounded-sm border border-ink/10 px-5 py-4 md:col-span-5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full bg-gold-dark transition-all" style={{ width: `${confirmedPct}%` }} />
        </div>
        <span className="font-body text-xs text-ink/60">{confirmedPct}% confirmado</span>
      </div>
    </div>
  );
}
