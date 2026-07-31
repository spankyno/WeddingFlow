"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEventMediaInput } from "@/lib/validators/event-media";

export function useEventMedia(eventId: string) {
  return useQuery({
    queryKey: ["media", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/celebrations/${eventId}/media`);
      if (!res.ok) throw new Error("Error al cargar la galería");
      return res.json() as Promise<{ items: any[] }>;
    },
  });
}

export function useAddEventMedia(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventMediaInput) =>
      fetch(`/api/celebrations/${eventId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => {
        if (!res.ok) throw new Error("Error al añadir el elemento");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media", eventId] }),
  });
}

export function useDeleteEventMedia(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) =>
      fetch(`/api/celebrations/${eventId}/media/${mediaId}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Error al eliminar el elemento");
        return res.json();
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media", eventId] }),
  });
}
