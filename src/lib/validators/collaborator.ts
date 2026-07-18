import { z } from "zod";

export const inviteCollaboratorSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "organizer", "wedding_planner", "collaborator"]).default("collaborator"),
});
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
