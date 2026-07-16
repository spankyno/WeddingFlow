"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { createGuestSchema, type CreateGuestInput } from "@/lib/validators/guest";
import { useCreateGuest } from "@/hooks/use-guests";

export function AddGuestDialog({
  eventId,
  open,
  onClose,
}: {
  eventId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync, isPending } = useCreateGuest(eventId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGuestInput>({
    resolver: zodResolver(createGuestSchema),
    defaultValues: { isVip: false, isChild: false, maxCompanions: 0 },
  });

  async function onSubmit(values: CreateGuestInput) {
    await mutateAsync(values);
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Añadir invitado">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Nombre completo
          </label>
          <input
            {...register("fullName")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-ink/60">
              Email
            </label>
            <input
              {...register("email")}
              className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-ink/60">
              Teléfono
            </label>
            <input
              {...register("phone")}
              className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-ink/60">
              Grupo / familia (opcional)
            </label>
            <input
              {...register("groupName")}
              placeholder="Familia García"
              className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
            />
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-ink/60">
              Acompañantes permitidos
            </label>
            <input
              type="number"
              min={0}
              {...register("maxCompanions")}
              className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" {...register("isVip")} className="accent-gold-dark" />
            VIP
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" {...register("isChild")} className="accent-gold-dark" />
            Es un niño
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-ink px-8 py-3 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Añadir invitado"}
        </button>
      </form>
    </Dialog>
  );
}
