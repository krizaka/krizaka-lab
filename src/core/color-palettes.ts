/**
 * @krizaka/motion — Brand Colors & Token Mappings
 * Conforms with @krizaka/tokens and Krizaka brand identity.
 */

import { ProductId, JarvisTheme } from "./types";

export interface BrandColorConfig {
  id: ProductId;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  rgb: [number, number, number];
}

export const PRODUCT_BRANDS: Record<ProductId, BrandColorConfig> = {
  orazaka: {
    id: "orazaka",
    name: "Orazaka",
    primary: "#f97316", // Orange
    secondary: "#fdba74",
    glow: "rgba(249, 115, 22, 0.45)",
    rgb: [249, 115, 22],
  },
  yomizaka: {
    id: "yomizaka",
    name: "Yomizaka",
    primary: "#6366f1", // Indigo
    secondary: "#a5b4fc",
    glow: "rgba(99, 102, 241, 0.45)",
    rgb: [99, 102, 241],
  },
  orochia: {
    id: "orochia",
    name: "Orochia",
    primary: "#a855f7", // Violet
    secondary: "#ec4899", // Magenta
    glow: "rgba(168, 85, 247, 0.45)",
    rgb: [168, 85, 247],
  },
  kachizaka: {
    id: "kachizaka",
    name: "Kachizaka",
    primary: "#eab308", // Gold
    secondary: "#3b82f6", // Cobalt
    glow: "rgba(234, 179, 8, 0.45)",
    rgb: [234, 179, 8],
  },
  akinaza: {
    id: "akinaza",
    name: "Akinaza",
    primary: "#10b981", // Emerald
    secondary: "#d97706", // Copper
    glow: "rgba(16, 185, 129, 0.45)",
    rgb: [16, 185, 129],
  },
  yasakia: {
    id: "yasakia",
    name: "Yasakia",
    primary: "#14b8a6", // Turquoise
    secondary: "#06b6d4",
    glow: "rgba(20, 184, 166, 0.45)",
    rgb: [20, 184, 166],
  },
  yororis: {
    id: "yororis",
    name: "Yororis",
    primary: "#7c9082", // Sage
    secondary: "#b8c5b9", // Sand
    glow: "rgba(124, 144, 130, 0.45)",
    rgb: [124, 144, 130],
  },
};

export const JARVIS_THEMES: Record<
  JarvisTheme,
  {
    primary: string;
    secondary: string;
    glow: string;
    accent: string;
    bgGlow: string;
    rgb: [number, number, number];
  }
> = {
  cyan: {
    primary: "#00f0ff",
    secondary: "#38bdf8",
    glow: "rgba(0, 240, 255, 0.5)",
    accent: "#67e8f9",
    bgGlow: "rgba(0, 240, 255, 0.08)",
    rgb: [0, 240, 255],
  },
  orazaka: {
    primary: "#f97316",
    secondary: "#fb923c",
    glow: "rgba(249, 115, 22, 0.55)",
    accent: "#ffedd5",
    bgGlow: "rgba(249, 115, 22, 0.09)",
    rgb: [249, 115, 22],
  },
  yororis: {
    primary: "#7c9082",
    secondary: "#9cb1a3",
    glow: "rgba(124, 144, 130, 0.5)",
    accent: "#d8e2dc",
    bgGlow: "rgba(124, 144, 130, 0.08)",
    rgb: [124, 144, 130],
  },
  crimson: {
    primary: "#ef4444",
    secondary: "#f87171",
    glow: "rgba(239, 68, 68, 0.6)",
    accent: "#fca5a5",
    bgGlow: "rgba(239, 68, 68, 0.12)",
    rgb: [239, 68, 68],
  },
  gold: {
    primary: "#eab308",
    secondary: "#facc15",
    glow: "rgba(234, 179, 8, 0.55)",
    accent: "#fef08a",
    bgGlow: "rgba(234, 179, 8, 0.1)",
    rgb: [234, 179, 8],
  },
};
