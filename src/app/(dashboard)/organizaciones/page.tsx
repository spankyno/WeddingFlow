"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@/hooks/use-organizations";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/lib/validators/organization";

export default function OrganizationsPage() {
  const { data, isLoading } = useOrganizations();
  const { mutateAsync: create, isPending: isCreating } = useCreateOrganization();
  const { mutate: update } = useUpdateOrganization();
  const { mutate: remove } = useDeleteOrganization();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({ resolver: zodResolver(createOrganizationSchema) });

  async function onSubmit(values: CreateOrganizationInput) {
    await create(values);
    reset();
  }

  function startEditing(org: any) {
    setEditingId(org.id);
    setEditingName(org.name);
  }

  function saveEditing(orgId: string) {
    if (editingName.trim().length >= 2) {
      update({ orgId, input: { name: editingName.trim() } });
    }
    setEditingId(null);
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Organizaciones</h1>
      <p className="mt-2 max-w-lg text-sm text-ink/60">
        Si gestionas bodas de varios clientes (por ejemplo, como wedding planner), crea aquí
        una organización por cliente y asígnala al crear cada evento — tu dashboard los
        agrupará automáticamente.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex max-w-md items-end gap-4 rounded-sm border border-ink/10 p-5"
      >
        <div className="flex-1">
          <label className="font-body text-xs uppercase tracking-widest text-ink/60">
            Nombre del cliente / organización
          </label>
          <input
            {...register("name")}
            placeholder="Ej. Laura & Marcos, o Bodas Hotel Palacio"
            className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-gold-dark"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-full bg-ink px-6 py-2.5 font-body text-xs uppercase tracking-widest text-parchment hover:bg-gold-dark disabled:opacity-50"
        >
          {isCreating ? "Creando…" : "+ Crear"}
        </button>
      </form>

      <div className="mt-8 max-w-md space-y-2">
        {isLoading && <p className="text-ink/60">Cargando…</p>}
        {data?.items.map((org: any) => (
          <div key={org.id} className="flex items-center justify-between rounded-sm border border-ink/10 px-4 py-3">
            {editingId === org.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveEditing(org.id)}
                onKeyDown={(e) => e.key === "Enter" && saveEditing(org.id)}
                autoFocus
                className="flex-1 border-b border-gold-dark bg-transparent outline-none"
              />
            ) : (
              <button onClick={() => startEditing(org)} className="flex-1 text-left hover:underline">
                {org.name}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`¿Eliminar "${org.name}"? Los eventos asignados quedarán sin organización.`)) {
                  remove(org.id);
                }
              }}
              className="ml-3 text-xs text-ink/40 hover:text-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
        {data?.items.length === 0 && (
          <p className="text-sm text-ink/50">Todavía no has creado ninguna organización.</p>
        )}
      </div>
    </div>
  );
}
