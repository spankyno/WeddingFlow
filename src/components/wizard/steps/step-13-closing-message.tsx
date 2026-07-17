"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUpdateEventDetails } from "@/hooks/use-event-config";

export function Step13ClosingMessage({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error("Error al cargar el evento");
      return res.json() as Promise<{ event: any }>;
    },
  });
  const { mutateAsync, isPending } = useUpdateEventDetails(eventId);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data?.event) setMessage(data.event.closingMessage ?? "");
  }, [data]);

  async function handleContinue() {
    await mutateAsync({ closingMessage: message });
    router.push(`/eventos/${eventId}/wizard/14`);
  }

  if (isLoading) return <p className="text-ink/60">Cargando…</p>;

  return (
    <div className="max-w-xl">
      <label className="font-body text-xs uppercase tracking-widest text-ink/60">
        Mensaje de despedida (aparece al final de la invitación)
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        placeholder="Gracias por acompañarnos en este día tan especial…"
        className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
      />

      <button
        onClick={handleContinue}
        disabled={isPending}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Continuar"}
      </button>
    </div>
  );
}
