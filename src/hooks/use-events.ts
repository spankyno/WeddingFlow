"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEventInput } from "@/lib/validators/event";

async function fetchEvents() {
  const res = await fetch("/api/celebrations");
  if (!res.ok) throw new Error("Error al cargar eventos");
  return (await res.json()) as { items: any[] };
}

async function postEvent(input: CreateEventInput) {
  const res = await fetch("/api/celebrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Error al crear el evento");
  return (await res.json()) as { id: string; slug: string };
}

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: fetchEvents });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
