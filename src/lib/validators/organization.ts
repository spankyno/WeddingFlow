import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
