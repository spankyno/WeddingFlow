import { describe, it, expect } from "vitest";
import { THEME_PRESET_DEFAULTS, THEME_LABELS, CURATED_GOOGLE_FONTS } from "@/lib/theme-presets";
import { themePresetEnum } from "@drizzle/schema";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

describe("THEME_PRESET_DEFAULTS", () => {
  it("tiene una entrada para cada preset del enum de la base de datos", () => {
    for (const preset of themePresetEnum) {
      expect(THEME_PRESET_DEFAULTS[preset]).toBeDefined();
    }
  });

  it("todos los colores de cada preset son hexadecimales válidos", () => {
    for (const preset of themePresetEnum) {
      const values = THEME_PRESET_DEFAULTS[preset];
      expect(values.colorPrimary).toMatch(HEX_COLOR);
      expect(values.colorSecondary).toMatch(HEX_COLOR);
      expect(values.colorText).toMatch(HEX_COLOR);
      expect(values.colorButton).toMatch(HEX_COLOR);
      expect(values.colorBackground).toMatch(HEX_COLOR);
    }
  });

  it("todos los presets tienen tipografía de título y de cuerpo definidas", () => {
    for (const preset of themePresetEnum) {
      const values = THEME_PRESET_DEFAULTS[preset];
      expect(values.fontHeading.length).toBeGreaterThan(0);
      expect(values.fontBody.length).toBeGreaterThan(0);
    }
  });
});

describe("THEME_LABELS", () => {
  it("tiene una etiqueta legible para cada preset", () => {
    for (const preset of themePresetEnum) {
      expect(THEME_LABELS[preset]).toBeTruthy();
    }
  });
});

describe("CURATED_GOOGLE_FONTS", () => {
  it("no está vacía y no tiene duplicados", () => {
    expect(CURATED_GOOGLE_FONTS.length).toBeGreaterThan(0);
    expect(new Set(CURATED_GOOGLE_FONTS).size).toBe(CURATED_GOOGLE_FONTS.length);
  });
});
