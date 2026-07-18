"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  useAgenda,
  useCreateAgendaItem,
  useDeleteAgendaItem,
  useReorderAgendaItems,
} from "@/hooks/use-wizard-extras";
import { createAgendaItemSchema, type CreateAgendaItemInput } from "@/lib/validators/wizard-extras";

export function Step6Agenda({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useAgenda(eventId);
  const { mutateAsync: createItem, isPending: isCreating } = useCreateAgendaItem(eventId);
  const { mutate: deleteItem } = useDeleteAgendaItem(eventId);
  const { mutate: reorder } = useReorderAgendaItems(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAgendaItemInput>({ resolver: zodResolver(createAgendaItemSchema) });

  async function onSubmit(values: CreateAgendaItemInput) {
    await createItem(values);
    reset();
  }

  function move(index: number, direction: -1 | 1) {
    if (!data?.items) return;
    const items = [...data.items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [items[index], items[targetIndex]] = [items[targetIndex]!, items[index]!];
    reorder({ items: items.map((it, i) => ({ id: it.id, sortOrder: i })) });
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 rounded-sm border border-ink/10 p-5">
        <div className="col-span-2">
          <input
            {...register("title")}
            placeholder="Ej. Ceremonia"
            className="w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <input
          {...register("time")}
          type="time"
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <input
          {...register("location")}
          placeholder="Ubicación"
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <textarea
          {...register("description")}
          placeholder="Descripción (opcional)"
          rows={2}
          className="col-span-2 border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="col-span-2 justify-self-start rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isCreating ? "Añadiendo…" : "+ Añadir a la agenda"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((item: any, index: number) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3"
          >
            <div>
              <p className="font-display text-lg">
                {item.title} {item.time && <span className="text-sm text-ink/50">· {item.time}</span>}
              </p>
              {(item.location || item.description) && (
                <p className="text-xs text-ink/50">
                  {[item.location, item.description].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(index, -1)} className="px-2 text-ink/40 hover:text-ink">
                ↑
              </button>
              <button onClick={() => move(index, 1)} className="px-2 text-ink/40 hover:text-ink">
                ↓
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="ml-2 text-xs text-ink/40 hover:text-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/eventos/${eventId}/wizard/7`)}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
      >
        Continuar
      </button>
    </div>
  );
}
