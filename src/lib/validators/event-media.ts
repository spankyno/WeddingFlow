import { z } from "zod";

export const createEventMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url("URL inválida"),
});
export type CreateEventMediaInput = z.infer<typeof createEventMediaSchema>;

export const reorderEventMediaSchema = z.object({
  items: z.array(z.object({ id: z.string(), sortOrder: z.number().int().min(0) })).min(1),
});
export type ReorderEventMediaInput = z.infer<typeof reorderEventMediaSchema>;
