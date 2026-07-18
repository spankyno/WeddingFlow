import { z } from "zod";

// La subida del archivo a Cloudinary ocurre en el cliente; aquí solo se guarda la URL
// resultante (secure_url) junto con el evento y, si se sabe, el invitado que la subió.
export const createAlbumPhotoSchema = z.object({
  url: z.string().url("URL inválida"),
  guestSlug: z.string().min(1).optional(),
});
export type CreateAlbumPhotoInput = z.infer<typeof createAlbumPhotoSchema>;

export const updateAlbumPhotoStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});
export type UpdateAlbumPhotoStatusInput = z.infer<typeof updateAlbumPhotoStatusSchema>;
