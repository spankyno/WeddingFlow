"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTableInput, UpdateTableInput } from "@/lib/validators/table";

async function fetchTables(eventId: string) {
  const res = await fetch(`/api/events/${eventId}/tables`);
  if (!res.ok) throw new Error("Error al cargar mesas");
  return (await res.json()) as { items: any[] };
}

export function useTables(eventId: string) {
  return useQuery({ queryKey: ["tables", eventId], queryFn: () => fetchTables(eventId) });
}

export function useCreateTable(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTableInput) => {
      const res = await fetch(`/api/events/${eventId}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al crear mesa");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tables", eventId] }),
  });
}

export function useUpdateTable(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableId, input }: { tableId: string; input: UpdateTableInput }) => {
      const res = await fetch(`/api/events/${eventId}/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al actualizar mesa");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tables", eventId] }),
  });
}

export function useDeleteTable(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tableId: string) => {
      const res = await fetch(`/api/events/${eventId}/tables/${tableId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar mesa");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", eventId] });
      queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
    },
  });
}
