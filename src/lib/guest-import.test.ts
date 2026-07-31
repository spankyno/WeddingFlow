import { describe, it, expect } from "vitest";
import { normalizeHeader, autoDetectMapping, toBoolean, normalizeRow } from "@/lib/guest-import";

describe("normalizeHeader", () => {
  it("pasa a minúsculas y quita acentos", () => {
    expect(normalizeHeader("Teléfono")).toBe("telefono");
    expect(normalizeHeader("  Nombre Completo  ")).toBe("nombre completo");
  });
});

describe("autoDetectMapping", () => {
  it("detecta columnas por alias, sin distinguir mayúsculas/acentos", () => {
    const mapping = autoDetectMapping(["Nombre", "Teléfono", "Mesa", "Columna rara"]);
    expect(mapping.fullName).toBe("Nombre");
    expect(mapping.phone).toBe("Teléfono");
    expect(mapping.tableName).toBe("Mesa");
    expect(mapping.email).toBeNull();
  });

  it("no mapea nada si no hay coincidencias", () => {
    const mapping = autoDetectMapping(["Columna A", "Columna B"]);
    expect(Object.values(mapping).every((v) => v === null)).toBe(true);
  });
});

describe("toBoolean", () => {
  it("reconoce valores de verdad habituales en español e inglés", () => {
    expect(toBoolean("si")).toBe(true);
    expect(toBoolean("Sí")).toBe(true);
    expect(toBoolean("VIP")).toBe(true);
    expect(toBoolean("x")).toBe(true);
    expect(toBoolean("yes")).toBe(true);
    expect(toBoolean(true)).toBe(true);
  });

  it("todo lo demás se interpreta como falso", () => {
    expect(toBoolean("no")).toBe(false);
    expect(toBoolean("")).toBe(false);
    expect(toBoolean(undefined)).toBe(false);
    expect(toBoolean(null)).toBe(false);
    expect(toBoolean(0)).toBe(false);
  });
});

describe("normalizeRow", () => {
  const mapping = autoDetectMapping(["Nombre", "Email", "Acompañantes", "VIP"]);

  it("usa el mapeo para extraer y convertir cada campo", () => {
    const row = { Nombre: " Ana García ", Email: "ana@example.com", Acompañantes: "2", VIP: "si" };
    const result = normalizeRow(row, mapping);
    expect(result.fullName).toBe("Ana García");
    expect(result.email).toBe("ana@example.com");
    expect(result.maxCompanions).toBe(2);
    expect(result.isVip).toBe(true);
  });

  it("los campos no mapeados quedan en su valor por defecto", () => {
    const row = { Nombre: "Ana" };
    const result = normalizeRow(row, mapping);
    expect(result.phone).toBe("");
    expect(result.groupName).toBe("");
    expect(result.isChild).toBe(false);
  });

  it("un valor no numérico en acompañantes cae a 0 en vez de NaN", () => {
    const row = { Nombre: "Ana", Acompañantes: "no sé" };
    const result = normalizeRow(row, mapping);
    expect(result.maxCompanions).toBe(0);
  });
});
