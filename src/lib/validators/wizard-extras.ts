import { z } from "zod";
import { giftMethodEnum } from "@drizzle/schema";

/* -------------------------------------- Agenda -------------------------------------- */

export const createAgendaItemSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120),
  time: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
});
export type CreateAgendaItemInput = z.infer<typeof createAgendaItemSchema>;

export const reorderAgendaItemsSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number().int().min(0) })).min(1),
});
export type ReorderAgendaItemsInput = z.infer<typeof reorderAgendaItemsSchema>;

/* ------------------------------------ Dress code ------------------------------------ */

export const updateDressCodeSchema = z.object({
  descriptionText: z.string().max(1000).optional().or(z.literal("")),
  color1: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
  color2: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
  color3: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
});
export type UpdateDressCodeInput = z.infer<typeof updateDressCodeSchema>;

/* ---------------------------------- Lista de regalos --------------------------------- */

export const createGiftOptionSchema = z.object({
  method: z.enum(giftMethodEnum),
  label: z.string().max(120).optional().or(z.literal("")),
  value: z.string().max(300).optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal("")),
});
export type CreateGiftOptionInput = z.infer<typeof createGiftOptionSchema>;

/* --------------------------------------- Hoteles -------------------------------------- */

export const createHotelSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(150),
  address: z.string().max(300).optional().or(z.literal("")),
  priceHint: z.string().max(60).optional().or(z.literal("")),
  websiteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
});
export type CreateHotelInput = z.infer<typeof createHotelSchema>;

/* -------------------------------------- Transporte ------------------------------------- */

export const createTransportOptionSchema = z.object({
  type: z.enum(["bus", "parking", "taxi", "directions"]),
  description: z.string().max(500).optional().or(z.literal("")),
});
export type CreateTransportOptionInput = z.infer<typeof createTransportOptionSchema>;

/* ------------------------------------------ FAQ ----------------------------------------- */

export const createFaqSchema = z.object({
  question: z.string().min(1, "La pregunta es obligatoria").max(200),
  answer: z.string().min(1, "La respuesta es obligatoria").max(1000),
});
export type CreateFaqInput = z.infer<typeof createFaqSchema>;

export const reorderFaqsSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number().int().min(0) })).min(1),
});
export type ReorderFaqsInput = z.infer<typeof reorderFaqsSchema>;
