"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCollaborators,
  useInviteCollaborator,
  useRemoveCollaborator,
} from "@/hooks/use-collaborators";
import { inviteCollaboratorSchema, type InviteCollaboratorInput } from "@/lib/validators/collaborator";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  organizer: "Organizador",
  wedding_planner: "Wedding Planner",
  collaborator: "Colaborador",
};

export default function CollaboratorsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data, isLoading } = useCollaborators(eventId);
  const { mutateAsync: invite, isPending: isInviting } = useInviteCollaborator(eventId);
  const { mutate: remove } = useRemoveCollaborator(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteCollaboratorInput>({
    resolver: zodResolver(inviteCollaboratorSchema),
    defaultValues: { role: "collaborator" },
  });

  async function onSubmit(values: InviteCollaboratorInput) {
    await invite(values);
    reset();
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Colaboradores</h1>
      <p className="mt-2 max-w-lg text-sm text-ink/60">
        Invita a otras personas (wedding planner, familia, pareja) a ayudarte a gestionar
        este evento. Podrán editar invitados, mesas, el wizard y todo el contenido — solo tú
        puedes invitar/eliminar colaboradores o borrar el evento.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex max-w-lg flex-wrap items-end gap-4 rounded-sm border border-ink/10 p-5"
      >
        <div className="flex-1">
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">Email</label>
          <input
            {...register("email")}
            placeholder="nombre@email.com"
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">Rol</label>
          <select
            {...register("role")}
            className="mt-2 border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isInviting}
          className="rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isInviting ? "Invitando…" : "Invitar"}
        </button>
      </form>

      <div className="mt-8 max-w-lg space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((collab: any) => (
          <div
            key={collab.id}
            className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3"
          >
            <div>
              <p>{collab.invitedEmail}</p>
              <p className="text-xs text-ink/50">
                {ROLE_LABELS[collab.role]} ·{" "}
                {collab.acceptedAt ? "Activo" : "Invitación pendiente"}
              </p>
            </div>
            <button
              onClick={() => remove(collab.id)}
              className="text-xs text-ink/40 hover:text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
        {data?.items.length === 0 && (
          <p className="text-sm text-ink/50">Todavía no has invitado a nadie.</p>
        )}
      </div>
    </div>
  );
}
