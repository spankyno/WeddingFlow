import { describe, it, expect } from "vitest";
import { nanoid, cn } from "@/lib/utils";

describe("nanoid", () => {
  it("genera un id de la longitud solicitada", () => {
    expect(nanoid(12)).toHaveLength(12);
    expect(nanoid(6)).toHaveLength(6);
  });

  it("usa la longitud por defecto (12) si no se especifica", () => {
    expect(nanoid()).toHaveLength(12);
  });

  it("solo contiene caracteres alfanuméricos (seguro para usar en URLs/slugs)", () => {
    const id = nanoid(50);
    expect(id).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("genera valores distintos en llamadas sucesivas", () => {
    const ids = new Set(Array.from({ length: 50 }, () => nanoid()));
    expect(ids.size).toBe(50);
  });
});

describe("cn", () => {
  it("combina clases de Tailwind sin duplicar la que gana el conflicto", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});
