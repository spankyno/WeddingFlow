import { z } from "zod";
import { eventTypeEnum, themePresetEnum, sectionKeyEnum, eventStatusEnum } from "@drizzle/schema";

export const createEventSchema = z.object({
  eventType: z.enum(eventTypeEnum).default("wedding"),
  title: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre es demasiado largo"),
  eventDate: z.string().date("Fecha inválida").optional(),
  eventTime: z.string().optional(),
  ceremonyLocationName: z.string().max(200).optional(),
  ceremonyLat: z.number().min(-90).max(90).optional(),
  ceremonyLng: z.number().min(-180).max(180).optional(),
  celebrationLocationName: z.string().max(200).optional(),
  celebrationLat: z.number().min(-90).max(90).optional(),
  celebrationLng: z.number().min(-180).max(180).optional(),
  storyText: z.string().max(4000).optional(),
  organizationId: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateThemeSchema = z.object({
  themePreset: z.enum(themePresetEnum),
  colorPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal inválido"),
  colorSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorText: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorButton: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontHeading: z.string().min(1),
  fontBody: z.string().min(1),
});

export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;

export const rsvpSubmitSchema = z.object({
  guestSlug: z.string().min(1),
  willAttend: z.boolean(),
  companionsCount: z.number().int().min(0).max(20).default(0),
  dietaryRestrictions: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export type RsvpSubmitInput = z.infer<typeof rsvpSubmitSchema>;

export const sectionStyleOverridesSchema = z.object({
  colorBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  colorText: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});
export type SectionStyleOverrides = z.infer<typeof sectionStyleOverridesSchema>;

export const updateSectionsSchema = z.object({
  sections: z
    .array(
      z.object({
        sectionKey: z.enum(sectionKeyEnum),
        isEnabled: z.boolean(),
        sortOrder: z.number().int().min(0),
        styleOverrides: sectionStyleOverridesSchema.optional(),
      })
    )
    .min(1),
});

export type UpdateSectionsInput = z.infer<typeof updateSectionsSchema>;

export const updateRsvpConfigSchema = z.object({
  askPhone: z.boolean(),
  askEmail: z.boolean(),
  askCompanions: z.boolean(),
  askDietary: z.boolean(),
  askChildren: z.boolean(),
  askMessage: z.boolean(),
});

export type UpdateRsvpConfigInput = z.infer<typeof updateRsvpConfigSchema>;

export const updateEventDetailsSchema = z.object({
  closingMessage: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(eventStatusEnum).optional(),
});

export type UpdateEventDetailsInput = z.infer<typeof updateEventDetailsSchema>;
