"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, type CreateEventInput } from "@/lib/validators/event";
import { useCreateEvent } from "@/hooks/use-events";
import { useOrganizations } from "@/hooks/use-organizations";
import { useRouter } from "next/navigation";

export function Step1BasicInfo() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateEvent();
  const { data: orgsData } = useOrganizations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { eventType: "wedding" },
  });

  async function onSubmit(values: CreateEventInput) {
    const { id } = await mutateAsync(values);
    router.push(`/eventos/${id}/wizard/2`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-8">
      <div>
        <label className="font-body text-xs uppercase tracking-widest text-ink/60">
          Nombre de los novios / título del evento
        </label>
        <input
          {...register("title")}
          placeholder="Laura & Marcos"
          className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 font-display text-2xl outline-none focus:border-gold-dark"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">Fecha</label>
          <input
            type="date"
            {...register("eventDate")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
          />
        </div>
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">Hora</label>
          <input
            type="time"
            {...register("eventTime")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Lugar de la ceremonia
          </label>
          <input
            {...register("ceremonyLocationName")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
          />
        </div>
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Lugar de la celebración (si es distinto)
          </label>
          <input
            {...register("celebrationLocationName")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
          />
        </div>
      </div>

      <div>
        <label className="font-body text-xs uppercase tracking-widest text-ink/60">
          Vuestra historia
        </label>
        <textarea
          {...register("storyText")}
          rows={5}
          className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
        />
      </div>

      {orgsData && orgsData.items.length > 0 && (
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Organización / cliente (opcional)
          </label>
          <select
            {...register("organizationId")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 outline-none focus:border-gold-dark"
          >
            <option value="">Sin organización</option>
            {orgsData.items.map((org: any) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
      >
        {isPending ? "Creando…" : "Continuar"}
      </button>
    </form>
  );
}
