"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  useTransportOptions,
  useCreateTransportOption,
  useDeleteTransportOption,
} from "@/hooks/use-wizard-extras";
import { createTransportOptionSchema, type CreateTransportOptionInput } from "@/lib/validators/wizard-extras";

const TYPE_LABELS: Record<string, string> = {
  bus: "Autobús",
  parking: "Parking",
  taxi: "Taxi",
  directions: "Indicaciones",
};

export function Step10Transport({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useTransportOptions(eventId);
  const { mutateAsync: createOption, isPending: isCreating } = useCreateTransportOption(eventId);
  const { mutate: deleteOption } = useDeleteTransportOption(eventId);

  const { register, handleSubmit, reset } = useForm<CreateTransportOptionInput>({
    resolver: zodResolver(createTransportOptionSchema),
    defaultValues: { type: "bus" },
  });

  async function onSubmit(values: CreateTransportOptionInput) {
    await createOption(values);
    reset();
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 rounded-sm border border-ink/10 p-5">
        <select
          {...register("type")}
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <textarea
          {...register("description")}
          placeholder="Ej. Saldrá un autobús desde la plaza mayor a las 17:00"
          rows={2}
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="justify-self-start rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isCreating ? "Añadiendo…" : "+ Añadir opción"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((option: any) => (
          <div
            key={option.id}
            className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3"
          >
            <div>
              <p className="font-display text-lg">{TYPE_LABELS[option.type]}</p>
              {option.description && <p className="text-xs text-ink/50">{option.description}</p>}
            </div>
            <button
              onClick={() => deleteOption(option.id)}
              className="text-xs text-ink/40 hover:text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/eventos/${eventId}/wizard/11`)}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
      >
        Continuar
      </button>
    </div>
  );
}
