import { z } from "zod";

export const createGuestSchema = z.object({
  fullName: z.string().min(2, "El nombre es obligatorio").max(150),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  isVip: z.boolean().default(false),
  isChild: z.boolean().default(false),
  maxCompanions: z.coerce.number().int().min(0).max(20).default(0),
  groupName: z.string().max(120).optional().or(z.literal("")),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;

export const updateGuestSchema = createGuestSchema.partial().extend({
  tableId: z.string().nullable().optional(),
  rsvpStatus: z.enum(["pending", "confirmed", "declined"]).optional(),
});

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

// Fila de importación: igual que el alta manual, pero admite además el nombre de una mesa
// (se busca por nombre dentro del evento y, si no existe, se crea automáticamente).
export const importGuestRowSchema = createGuestSchema.extend({
  tableName: z.string().max(60).optional().or(z.literal("")),
});
export type ImportGuestRowInput = z.infer<typeof importGuestRowSchema>;

// Fila normalizada tal y como llega desde el mapeo de columnas del Excel en el cliente.
// El límite de 500 evita imports descontrolados; para volúmenes mayores se recomienda
// trocear el archivo en varias tandas desde el propio diálogo de importación.
export const bulkImportGuestsSchema = z.object({
  guests: z.array(importGuestRowSchema).min(1, "El archivo no contiene filas válidas").max(500),
});

export type BulkImportGuestsInput = z.infer<typeof bulkImportGuestsSchema>;

// Claves de columna reconocidas al mapear cabeceras del Excel/CSV subido.
// Se usa para el auto-detect en el diálogo de importación (case-insensitive, sin acentos).
export const GUEST_COLUMN_ALIASES: Record<keyof ImportGuestRowInput, string[]> = {
  fullName: ["nombre", "nombre completo", "invitado", "name", "full name"],
  email: ["email", "correo", "e-mail"],
  phone: ["telefono", "teléfono", "phone", "movil", "móvil"],
  isVip: ["vip"],
  isChild: ["nino", "niño", "es nino", "child", "menor"],
  maxCompanions: ["acompanantes", "acompañantes", "companions", "plus ones", "invitados extra"],
  groupName: ["grupo", "familia", "group", "family"],
  tableName: ["mesa", "table", "mesa asignada"],
};

// Búsqueda pública de un invitado por nombre, desde la invitación general (sin login).
export const lookupGuestByNameSchema = z.object({
  eventSlug: z.string().min(1),
  fullName: z.string().min(2).max(150),
});
export type LookupGuestByNameInput = z.infer<typeof lookupGuestByNameSchema>;
