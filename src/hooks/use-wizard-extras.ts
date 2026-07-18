"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAgendaItemInput,
  ReorderAgendaItemsInput,
  UpdateDressCodeInput,
  CreateGiftOptionInput,
  CreateHotelInput,
  CreateTransportOptionInput,
  CreateFaqInput,
  ReorderFaqsInput,
} from "@/lib/validators/wizard-extras";

async function jsonOrThrow(res: Response, errorMessage: string) {
  if (!res.ok) throw new Error(errorMessage);
  return res.json();
}

/* -------------------------------------- Agenda -------------------------------------- */

export function useAgenda(eventId: string) {
  return useQuery({
    queryKey: ["agenda", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/agenda`);
      return jsonOrThrow(res, "Error al cargar la agenda") as Promise<{ items: any[] }>;
    },
  });
}

export function useCreateAgendaItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAgendaItemInput) =>
      fetch(`/api/events/${eventId}/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al crear el elemento")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda", eventId] }),
  });
}

export function useDeleteAgendaItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      fetch(`/api/events/${eventId}/agenda/${itemId}`, { method: "DELETE" }).then((res) =>
        jsonOrThrow(res, "Error al eliminar el elemento")
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda", eventId] }),
  });
}

export function useReorderAgendaItems(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderAgendaItemsInput) =>
      fetch(`/api/events/${eventId}/agenda/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al reordenar")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda", eventId] }),
  });
}

/* ------------------------------------ Dress code ------------------------------------ */

export function useDressCode(eventId: string) {
  return useQuery({
    queryKey: ["dress-code", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/dress-code`);
      return jsonOrThrow(res, "Error al cargar el dress code") as Promise<{ config: any }>;
    },
  });
}

export function useUpdateDressCode(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDressCodeInput) =>
      fetch(`/api/events/${eventId}/dress-code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al actualizar el dress code")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dress-code", eventId] }),
  });
}

/* ---------------------------------- Lista de regalos --------------------------------- */

export function useGifts(eventId: string) {
  return useQuery({
    queryKey: ["gifts", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/gifts`);
      return jsonOrThrow(res, "Error al cargar los regalos") as Promise<{ items: any[] }>;
    },
  });
}

export function useCreateGiftOption(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGiftOptionInput) =>
      fetch(`/api/events/${eventId}/gifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al crear la opción")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gifts", eventId] }),
  });
}

export function useDeleteGiftOption(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (giftId: string) =>
      fetch(`/api/events/${eventId}/gifts/${giftId}`, { method: "DELETE" }).then((res) =>
        jsonOrThrow(res, "Error al eliminar la opción")
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gifts", eventId] }),
  });
}

/* --------------------------------------- Hoteles -------------------------------------- */

export function useHotels(eventId: string) {
  return useQuery({
    queryKey: ["hotels", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/hotels`);
      return jsonOrThrow(res, "Error al cargar los hoteles") as Promise<{ items: any[] }>;
    },
  });
}

export function useCreateHotel(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHotelInput) =>
      fetch(`/api/events/${eventId}/hotels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al crear el hotel")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hotels", eventId] }),
  });
}

export function useDeleteHotel(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hotelId: string) =>
      fetch(`/api/events/${eventId}/hotels/${hotelId}`, { method: "DELETE" }).then((res) =>
        jsonOrThrow(res, "Error al eliminar el hotel")
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hotels", eventId] }),
  });
}

/* -------------------------------------- Transporte ------------------------------------- */

export function useTransportOptions(eventId: string) {
  return useQuery({
    queryKey: ["transport", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/transport`);
      return jsonOrThrow(res, "Error al cargar el transporte") as Promise<{ items: any[] }>;
    },
  });
}

export function useCreateTransportOption(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransportOptionInput) =>
      fetch(`/api/events/${eventId}/transport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al crear la opción")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transport", eventId] }),
  });
}

export function useDeleteTransportOption(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string) =>
      fetch(`/api/events/${eventId}/transport/${optionId}`, { method: "DELETE" }).then((res) =>
        jsonOrThrow(res, "Error al eliminar la opción")
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transport", eventId] }),
  });
}

/* ------------------------------------------ FAQ ----------------------------------------- */

export function useFaqs(eventId: string) {
  return useQuery({
    queryKey: ["faqs", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/faq`);
      return jsonOrThrow(res, "Error al cargar las preguntas") as Promise<{ items: any[] }>;
    },
  });
}

export function useCreateFaq(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFaqInput) =>
      fetch(`/api/events/${eventId}/faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al crear la pregunta")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs", eventId] }),
  });
}

export function useDeleteFaq(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (faqId: string) =>
      fetch(`/api/events/${eventId}/faq/${faqId}`, { method: "DELETE" }).then((res) =>
        jsonOrThrow(res, "Error al eliminar la pregunta")
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs", eventId] }),
  });
}

export function useReorderFaqs(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderFaqsInput) =>
      fetch(`/api/events/${eventId}/faq/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((res) => jsonOrThrow(res, "Error al reordenar")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs", eventId] }),
  });
}
