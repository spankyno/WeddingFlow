import { z } from "zod";

export const createTableSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(60),
  capacity: z.coerce.number().int().min(1, "Mínimo 1").max(50).default(8),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#b6924f"),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;

export const updateTableSchema = createTableSchema.partial().extend({
  posX: z.number().optional(),
  posY: z.number().optional(),
});

export type UpdateTableInput = z.infer<typeof updateTableSchema>;
