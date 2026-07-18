"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useHotels, useCreateHotel, useDeleteHotel } from "@/hooks/use-wizard-extras";
import { createHotelSchema, type CreateHotelInput } from "@/lib/validators/wizard-extras";

export function Step9Hotels({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data, isLoading } = useHotels(eventId);
  const { mutateAsync: createHotel, isPending: isCreating } = useCreateHotel(eventId);
  const { mutate: deleteHotel } = useDeleteHotel(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHotelInput>({ resolver: zodResolver(createHotelSchema) });

  async function onSubmit(values: CreateHotelInput) {
    await createHotel(values);
    reset();
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 rounded-sm border border-ink/10 p-5">
        <div className="col-span-2">
          <input
            {...register("name")}
            placeholder="Nombre del hotel"
            className="w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <input
          {...register("address")}
          placeholder="Dirección"
          className="col-span-2 border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <input
          {...register("priceHint")}
          placeholder="Precio orientativo"
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <input
          {...register("phone")}
          placeholder="Teléfono"
          className="border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        <input
          {...register("websiteUrl")}
          placeholder="https://..."
          className="col-span-2 border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
        />
        {errors.websiteUrl && <p className="col-span-2 text-sm text-red-600">{errors.websiteUrl.message}</p>}
        <button
          type="submit"
          disabled={isCreating}
          className="col-span-2 justify-self-start rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isCreating ? "Añadiendo…" : "+ Añadir hotel"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((hotel: any) => (
          <div
            key={hotel.id}
            className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3"
          >
            <div>
              <p className="font-display text-lg">{hotel.name}</p>
              {hotel.address && <p className="text-xs text-ink/50">{hotel.address}</p>}
            </div>
            <button
              onClick={() => deleteHotel(hotel.id)}
              className="text-xs text-ink/40 hover:text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/eventos/${eventId}/wizard/10`)}
        className="mt-10 rounded-full bg-ink px-8 py-4 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark"
      >
        Continuar
      </button>
    </div>
  );
}
