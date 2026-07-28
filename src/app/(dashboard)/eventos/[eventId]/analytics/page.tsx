"use client";

import { use } from "react";
import { useAnalyticsSummary } from "@/hooks/use-analytics";

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Móvil",
  desktop: "Escritorio",
  tablet: "Tablet",
  unknown: "Desconocido",
};

export default function AnalyticsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data, isLoading } = useAnalyticsSummary(eventId);

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="font-display text-4xl">Analytics</h1>
        <p className="mt-10 text-ink/60">Cargando…</p>
      </div>
    );
  }

  const maxDayCount = Math.max(1, ...data.visitsByDay.map((d) => d.count));
  const totalDeviceCount = Object.values(data.deviceBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <h1 className="font-display text-4xl">Analytics</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Visitas totales", value: data.totalVisits },
          { label: "Invitados", value: data.guestStats.total },
          { label: "Confirmados", value: data.guestStats.confirmed },
          { label: "Asistentes totales", value: data.guestStats.totalConfirmedHeadcount },
        ].map((item) => (
          <div key={item.label} className="rounded-sm border border-ink/10 px-5 py-4">
            <p className="font-display text-3xl">{item.value}</p>
            <p className="mt-1 font-body text-xs uppercase tracking-widest text-ink/50">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <p className="font-body text-xs uppercase tracking-widest text-ink/50">
          Visitas — últimos 14 días
        </p>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {data.visitsByDay.map((d) => (
            <div key={d.date} className="flex-1 text-center">
              <div
                className="mx-auto w-full rounded-t-sm bg-gold-dark/70 transition-all"
                style={{ height: `${Math.max(4, (d.count / maxDayCount) * 100)}px` }}
                title={`${d.date}: ${d.count} visitas`}
              />
              <p className="mt-1 text-[10px] text-ink/40">{d.date.slice(8, 10)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 max-w-sm">
        <p className="font-body text-xs uppercase tracking-widest text-ink/50">Dispositivos</p>
        <div className="mt-4 space-y-2">
          {Object.entries(data.deviceBreakdown).map(([device, count]) => (
            <div key={device} className="flex items-center gap-3">
              <span className="w-20 text-sm text-ink/60">{DEVICE_LABELS[device] ?? device}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full bg-gold-dark"
                  style={{ width: `${(count / totalDeviceCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm text-ink/50">{count}</span>
            </div>
          ))}
          {Object.keys(data.deviceBreakdown).length === 0 && (
            <p className="text-sm text-ink/50">Todavía no hay visitas registradas.</p>
          )}
        </div>
      </div>

      <div className="mt-10 max-w-sm">
        <p className="font-body text-xs uppercase tracking-widest text-ink/50">
          Embudo de confirmación
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/60">Confirmados</span>
            <span>{data.guestStats.confirmed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Pendientes</span>
            <span>{data.guestStats.pending}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">No asisten</span>
            <span>{data.guestStats.declined}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
