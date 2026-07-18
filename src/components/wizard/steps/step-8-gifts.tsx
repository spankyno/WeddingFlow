"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useGifts, useCreateGiftOption, useDeleteGiftOption } from "@/hooks/use-wizard-extras";
import { createGiftOptionSchema, type CreateGiftOptionInput } from "@/lib/validators/wizard-extras";

const METHOD_LABELS: Record<string, string> = {
  iban: "IBAN",
  bizum: "Bizum",
  paypal: "PayPal",
  transfer: "Transferencia",
  amazon_list: "Lista de Amazon",
  custom_list: "Lista personalizada",
};

export function Step8Gifts({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useGifts(eventId);
  const { mutateAsync: createOption, isPending: isCreating } = useCreateGiftOption(eventId);
  const { mutate: deleteOption } = useDeleteGiftOption(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGiftOptionInput>({
    resolver: zodResolver(createGiftOptionSchema),
    defaultValues: { method: "iban" },
  });

  async function onSubmit(values: CreateGiftOptionInput) {
    await createOption(values);
    reset();
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 rounded-sm border border-ink/10 p-5">
        <select
          {...register("method")}
          className="col-span-2 border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        >
          {Object.entries(METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          {...register("label")}
          placeholder="Etiqueta (ej. Bizum de Laura)"
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <input
          {...register("value")}
          placeholder="IBAN / teléfono / enlace"
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <textarea
          {...register("message")}
          placeholder="Mensaje (opcional)"
          rows={2}
          className="col-span-2 border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="col-span-2 justify-self-start rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isCreating ? "Añadiendo…" : "+ Añadir opción"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((gift: any) => (
          <div
            key={gift.id}
            className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3"
          >
            <div>
              <p className="font-display text-lg">
                {METHOD_LABELS[gift.method]} {gift.label && <span className="text-sm text-ink/50">· {gift.label}</span>}
              </p>
              {gift.value && <p className="text-xs text-ink/50">{gift.value}</p>}
            </div>
            <button
              onClick={() => deleteOption(gift.id)}
              className="text-xs text-ink/40 hover:text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/eventos/${eventId}/wizard/9`)}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
      >
        Continuar
      </button>
    </div>
  );
}
