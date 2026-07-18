"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFaqs, useCreateFaq, useDeleteFaq, useReorderFaqs } from "@/hooks/use-wizard-extras";
import { createFaqSchema, type CreateFaqInput } from "@/lib/validators/wizard-extras";

export function Step11Faq({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useFaqs(eventId);
  const { mutateAsync: createFaq, isPending: isCreating } = useCreateFaq(eventId);
  const { mutate: deleteFaq } = useDeleteFaq(eventId);
  const { mutate: reorder } = useReorderFaqs(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFaqInput>({ resolver: zodResolver(createFaqSchema) });

  async function onSubmit(values: CreateFaqInput) {
    await createFaq(values);
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
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 rounded-sm border border-ink/10 p-5">
        <div>
          <input
            {...register("question")}
            placeholder="Pregunta"
            className="w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.question && <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>}
        </div>
        <div>
          <textarea
            {...register("answer")}
            placeholder="Respuesta"
            rows={2}
            className="w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.answer && <p className="mt-1 text-sm text-red-600">{errors.answer.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="justify-self-start rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isCreating ? "Añadiendo…" : "+ Añadir pregunta"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((faq: any, index: number) => (
          <div key={faq.id} className="rounded-sm border border-ink/10 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg">{faq.question}</p>
                <p className="mt-1 text-sm text-ink/60">{faq.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => move(index, -1)} className="px-2 text-ink/40 hover:text-ink">
                  ↑
                </button>
                <button onClick={() => move(index, 1)} className="px-2 text-ink/40 hover:text-ink">
                  ↓
                </button>
                <button
                  onClick={() => deleteFaq(faq.id)}
                  className="ml-2 text-xs text-ink/40 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/eventos/${eventId}/wizard/12`)}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
      >
        Continuar
      </button>
    </div>
  );
}
