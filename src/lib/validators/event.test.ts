import { describe, it, expect } from "vitest";
import { rsvpSubmitSchema } from "@/lib/validators/event";

describe("rsvpSubmitSchema", () => {
  it("acepta una confirmación mínima válida", () => {
    const result = rsvpSubmitSchema.safeParse({ guestSlug: "ana-abc123", willAttend: true });
    expect(result.success).toBe(true);
  });

  it("exige guestSlug — sin él no se puede identificar al invitado", () => {
    const result = rsvpSubmitSchema.safeParse({ willAttend: true });
    expect(result.success).toBe(false);
  });

  it("exige willAttend como booleano explícito", () => {
    const result = rsvpSubmitSchema.safeParse({ guestSlug: "ana-abc123" });
    expect(result.success).toBe(false);
  });

  it("companionsCount por defecto es 0 si no se envía", () => {
    const result = rsvpSubmitSchema.safeParse({ guestSlug: "ana-abc123", willAttend: true });
    if (!result.success) throw new Error("debería haber sido válido");
    expect(result.data.companionsCount).toBe(0);
  });

  it("rechaza más de 20 acompañantes (evita entradas absurdas/maliciosas)", () => {
    const result = rsvpSubmitSchema.safeParse({
      guestSlug: "ana-abc123",
      willAttend: true,
      companionsCount: 500,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un email mal formado si se aporta", () => {
    const result = rsvpSubmitSchema.safeParse({
      guestSlug: "ana-abc123",
      willAttend: true,
      email: "no-es-un-email",
    });
    expect(result.success).toBe(false);
  });
});
