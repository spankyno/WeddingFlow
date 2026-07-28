"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InviteCollaboratorInput } from "@/lib/validators/collaborator";

export function useCollaborators(eventId: string) {
  return useQuery({
    queryKey: ["collaborators", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/celebrations/${eventId}/collaborators`);
      if (!res.ok) throw new Error("Error al cargar colaboradores");
      return res.json() as Promise<{ items: any[] }>;
    },
  });
}

export function useInviteCollaborator(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteCollaboratorInput) =>
      fetch(`/api/celebrations/${eventId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => {
        if (!res.ok) throw new Error("Error al invitar");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collaborators", eventId] }),
  });
}

export function useRemoveCollaborator(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (collabId: string) =>
      fetch(`/api/celebrations/${eventId}/collaborators/${collabId}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collaborators", eventId] }),
  });
}
