"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { createTableSchema, type CreateTableInput } from "@/lib/validators/table";
import { useCreateTable } from "@/hooks/use-tables";

const COLOR_PRESETS = ["#b6924f", "#7c8871", "#e6cfc6", "#151312", "#8a6b34"];

export function AddTableDialog({
  eventId,
  open,
  onClose,
}: {
  eventId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { mutateAsync, isPending } = useCreateTable(eventId);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTableInput>({
    resolver: zodResolver(createTableSchema),
    defaultValues: { capacity: 8, color: COLOR_PRESETS[0] },
  });

  const selectedColor = watch("color");

  async function onSubmit(values: CreateTableInput) {
    await mutateAsync(values);
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Añadir mesa">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Nombre de la mesa
          </label>
          <input
            {...register("name")}
            placeholder="Mesa 1"
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Capacidad
          </label>
          <input
            type="number"
            min={1}
            {...register("capacity")}
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
        </div>

        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">Color</label>
          <div className="mt-2 flex gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setValue("color", c)}
                className={`h-8 w-8 rounded-full border-2 ${
                  selectedColor === c ? "border-ink" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-ink px-8 py-3 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
        >
          {isPending ? "Creando…" : "Crear mesa"}
        </button>
      </form>
    </Dialog>
  );
}
