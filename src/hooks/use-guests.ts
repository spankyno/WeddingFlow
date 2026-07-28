"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateGuestInput, UpdateGuestInput } from "@/lib/validators/guest";

type GuestStats = {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  totalConfirmedHeadcount: number;
};

async function fetchGuests(eventId: string) {
  const res = await fetch(`/api/celebrations/${eventId}/guests`);
  if (!res.ok) throw new Error("Error al cargar invitados");
  return (await res.json()) as { items: any[]; stats: GuestStats };
}

export function useGuests(eventId: string) {
  return useQuery({ queryKey: ["guests", eventId], queryFn: () => fetchGuests(eventId) });
}

export function useCreateGuest(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateGuestInput) => {
      const res = await fetch(`/api/celebrations/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al crear invitado");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guests", eventId] }),
  });
}

export function useUpdateGuest(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ guestId, input }: { guestId: string; input: UpdateGuestInput }) => {
      const res = await fetch(`/api/celebrations/${eventId}/guests/${guestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al actualizar invitado");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guests", eventId] }),
  });
}

export function useDeleteGuest(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guestId: string) => {
      const res = await fetch(`/api/celebrations/${eventId}/guests/${guestId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar invitado");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guests", eventId] }),
  });
}

export function useImportGuests(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guests: CreateGuestInput[]) => {
      const res = await fetch(`/api/celebrations/${eventId}/guests/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests }),
      });
      if (!res.ok) throw new Error("Error al importar invitados");
      return res.json() as Promise<{ inserted: number }>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guests", eventId] }),
  });
}
