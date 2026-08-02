"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "@/lib/validators/organization";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Error al cargar organizaciones");
      return res.json() as Promise<{ items: any[] }>;
    },
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) =>
      fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => {
        if (!res.ok) throw new Error("Error al crear la organización");
        return res.json() as Promise<{ id: string }>;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, input }: { orgId: string; input: UpdateOrganizationInput }) =>
      fetch(`/api/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => {
        if (!res.ok) throw new Error("Error al actualizar la organización");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) =>
      fetch(`/api/organizations/${orgId}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Error al eliminar la organización");
        return res.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
