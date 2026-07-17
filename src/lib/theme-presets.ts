import { themePresetEnum } from "@drizzle/schema";

export type ThemePreset = (typeof themePresetEnum)[number];

export type ThemeValues = {
  colorPrimary: string;
  colorSecondary: string;
  colorText: string;
  colorButton: string;
  colorBackground: string;
  fontHeading: string;
  fontBody: string;
};

export const THEME_LABELS: Record<ThemePreset, string> = {
  minimalista: "Minimalista",
  elegante: "Elegante",
  boho: "Boho",
  vintage: "Vintage",
  moderno: "Moderno",
  luxury: "Luxury",
  floral: "Floral",
  playa: "Playa",
  invierno: "Invierno",
  personalizado: "Personalizado",
};

// Valores de partida al elegir cada plantilla en el paso 2. El usuario puede afinarlos
// después en los pasos 3 (paleta) y 4 (tipografía) sin perder la plantilla elegida.
export const THEME_PRESET_DEFAULTS: Record<ThemePreset, ThemeValues> = {
  minimalista: {
    colorPrimary: "#1c1c1c",
    colorSecondary: "#8a8a8a",
    colorText: "#1c1c1c",
    colorButton: "#1c1c1c",
    colorBackground: "#ffffff",
    fontHeading: "Inter",
    fontBody: "Inter",
  },
  elegante: {
    colorPrimary: "#1c1c1c",
    colorSecondary: "#c9a86a",
    colorText: "#1c1c1c",
    colorButton: "#1c1c1c",
    colorBackground: "#faf8f5",
    fontHeading: "Cormorant Garamond",
    fontBody: "Jost",
  },
  boho: {
    colorPrimary: "#7c6a52",
    colorSecondary: "#c98a5e",
    colorText: "#4a3f33",
    colorButton: "#7c6a52",
    colorBackground: "#f5efe4",
    fontHeading: "Playfair Display",
    fontBody: "Lato",
  },
  vintage: {
    colorPrimary: "#5b4636",
    colorSecondary: "#a9745b",
    colorText: "#3d2f24",
    colorButton: "#5b4636",
    colorBackground: "#f2e9dc",
    fontHeading: "Libre Baskerville",
    fontBody: "EB Garamond",
  },
  moderno: {
    colorPrimary: "#111111",
    colorSecondary: "#3b82f6",
    colorText: "#111111",
    colorButton: "#111111",
    colorBackground: "#ffffff",
    fontHeading: "Poppins",
    fontBody: "Inter",
  },
  luxury: {
    colorPrimary: "#0b0b0b",
    colorSecondary: "#d4af37",
    colorText: "#0b0b0b",
    colorButton: "#0b0b0b",
    colorBackground: "#f7f5f0",
    fontHeading: "Playfair Display",
    fontBody: "Montserrat",
  },
  floral: {
    colorPrimary: "#6b4a5a",
    colorSecondary: "#e8a1b5",
    colorText: "#4a3540",
    colorButton: "#6b4a5a",
    colorBackground: "#fff5f7",
    fontHeading: "Cormorant Garamond",
    fontBody: "Nunito Sans",
  },
  playa: {
    colorPrimary: "#1d5c6b",
    colorSecondary: "#e3b64f",
    colorText: "#1d3b40",
    colorButton: "#1d5c6b",
    colorBackground: "#f7f9f6",
    fontHeading: "Quicksand",
    fontBody: "Nunito Sans",
  },
  invierno: {
    colorPrimary: "#1f2a3c",
    colorSecondary: "#9fb8d9",
    colorText: "#1f2a3c",
    colorButton: "#1f2a3c",
    colorBackground: "#f4f7fb",
    fontHeading: "Cormorant Garamond",
    fontBody: "Jost",
  },
  personalizado: {
    colorPrimary: "#1c1c1c",
    colorSecondary: "#c9a86a",
    colorText: "#1c1c1c",
    colorButton: "#1c1c1c",
    colorBackground: "#faf8f5",
    fontHeading: "Cormorant Garamond",
    fontBody: "Jost",
  },
};

// Subconjunto de Google Fonts curado para el selector del paso 4 — no la lista completa
// de Google Fonts (sería enorme), sino una selección que combina bien con invitaciones.
export const CURATED_GOOGLE_FONTS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Libre Baskerville",
  "EB Garamond",
  "Jost",
  "Inter",
  "Lato",
  "Montserrat",
  "Nunito Sans",
  "Poppins",
  "Quicksand",
  "Great Vibes",
  "Dancing Script",
] as const;
