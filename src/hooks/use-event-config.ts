"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateThemeInput, UpdateSectionsInput, UpdateRsvpConfigInput, UpdateEventDetailsInput } from "@/lib/validators/event";

/* -------------------------------------- Tema -------------------------------------- */

export function useTheme(eventId: string) {
  return useQuery({
    queryKey: ["theme", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/theme`);
      if (!res.ok) throw new Error("Error al cargar el tema");
      return res.json() as Promise<{ theme: any }>;
    },
  });
}

export function useUpdateTheme(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateThemeInput) => {
      const res = await fetch(`/api/events/${eventId}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al actualizar el tema");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["theme", eventId] }),
  });
}

/* ------------------------------------ Secciones ------------------------------------ */

export function useSections(eventId: string) {
  return useQuery({
    queryKey: ["sections", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/sections`);
      if (!res.ok) throw new Error("Error al cargar las secciones");
      return res.json() as Promise<{ items: any[] }>;
    },
  });
}

export function useUpdateSections(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateSectionsInput) => {
      const res = await fetch(`/api/events/${eventId}/sections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al actualizar las secciones");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", eventId] }),
  });
}

/* ---------------------------------- RSVP config ---------------------------------- */

export function useRsvpConfig(eventId: string) {
  return useQuery({
    queryKey: ["rsvp-config", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/rsvp-config`);
      if (!res.ok) throw new Error("Error al cargar la configuración de RSVP");
      return res.json() as Promise<{ config: any }>;
    },
  });
}

export function useUpdateRsvpConfig(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateRsvpConfigInput) => {
      const res = await fetch(`/api/events/${eventId}/rsvp-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al actualizar la configuración de RSVP");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rsvp-config", eventId] }),
  });
}

/* ------------------------------- Detalles del evento ------------------------------- */

export function useUpdateEventDetails(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateEventDetailsInput) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Error al actualizar el evento");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["event", eventId] }),
  });
}
