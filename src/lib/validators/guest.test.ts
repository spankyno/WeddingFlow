import { describe, it, expect } from "vitest";
import { createGuestSchema, importGuestRowSchema } from "@/lib/validators/guest";

describe("createGuestSchema", () => {
  it("acepta un invitado mínimo válido", () => {
    const result = createGuestSchema.safeParse({ fullName: "Ana García" });
    expect(result.success).toBe(true);
  });

  it("rechaza un nombre demasiado corto", () => {
    const result = createGuestSchema.safeParse({ fullName: "A" });
    expect(result.success).toBe(false);
  });

  it("rechaza un email con formato inválido", () => {
    const result = createGuestSchema.safeParse({ fullName: "Ana García", email: "no-es-un-email" });
    expect(result.success).toBe(false);
  });

  it("acepta email vacío (opcional en formularios)", () => {
    const result = createGuestSchema.safeParse({ fullName: "Ana García", email: "" });
    expect(result.success).toBe(true);
  });

  it("aplica los valores por defecto de isVip/isChild/maxCompanions", () => {
    const result = createGuestSchema.safeParse({ fullName: "Ana García" });
    if (!result.success) throw new Error("debería haber sido válido");
    expect(result.data.isVip).toBe(false);
    expect(result.data.isChild).toBe(false);
    expect(result.data.maxCompanions).toBe(0);
  });

  it("rechaza más de 20 acompañantes", () => {
    const result = createGuestSchema.safeParse({ fullName: "Ana García", maxCompanions: 21 });
    expect(result.success).toBe(false);
  });
});

describe("importGuestRowSchema", () => {
  it("hereda las mismas reglas que createGuestSchema y admite tableName", () => {
    const result = importGuestRowSchema.safeParse({ fullName: "Ana García", tableName: "Mesa 3" });
    expect(result.success).toBe(true);
  });

  it("rechaza fila sin nombre, como en una fila de Excel vacía", () => {
    const result = importGuestRowSchema.safeParse({ fullName: "" });
    expect(result.success).toBe(false);
  });
});
