import { z } from "zod";

export const createSongSuggestionSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(150),
  artist: z.string().max(150).optional().or(z.literal("")),
  guestSlug: z.string().min(1).optional(), // quién la sugiere, si se sabe (opcional, anónimo si no)
});
export type CreateSongSuggestionInput = z.infer<typeof createSongSuggestionSchema>;

export const updateSongStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});
export type UpdateSongStatusInput = z.infer<typeof updateSongStatusSchema>;
