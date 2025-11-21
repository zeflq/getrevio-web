import type { ThemePalette, ThemeTokens } from "@/types/domain";
import type { LandingThemeData } from "@/features/landings/theme/types";

export type ThemeType = {
  id: string;
  name: string;
  colors: ThemePalette;
};

export const landingThemes: Record<string, ThemeType> = {
  neutral: {
    id: "neutral",
    name: "Neutral Light",
    colors: {
      primary: "#334155",   // slate for titles
      secondary: "#64748B", // softer slate
      accent: "#F59E0B",    // subtle warm accent
      background: "#F9FAFB",
      text: "#111827",
    },
  },
  luxury: {
    id: "luxury",
    name: "Luxury Gold",
    colors: {
      primary: "#C6A667",   // soft gold
      secondary: "#8C7853", // bronze
      accent: "#EED9B7",    // champagne
      background: "#FAF7F2", // luxury beige
      text: "#1A1A1A",      // dark neutral
    },
  },
  boutique: {
    id: "boutique",
    name: "Boutique Green",
    colors: {
      primary: "#2E6F4E",   // premium forest green
      secondary: "#A9825A", // warm gold-brown
      accent: "#D9CBB5",    // sand
      background: "#F6F3ED",
      text: "#1F1F1F",
    },
  },
  mediterranean: {
    id: "mediterranean",
    name: "Mediterranean",
    colors: {
      primary: "#2071A6",    // sea blue
      secondary: "#ECA72C",  // warm orange
      accent: "#F7D488",     // sand gold
      background: "#F5F8FA", // light coastal tone
      text: "#1A1A1A",
    },
  },
  cozy: {
    id: "cozy",
    name: "Warm & Cozy",
    colors: {
      primary: "#CB6E3D",   // warm terracotta
      secondary: "#F2A65A", // soft peach
      accent: "#F7D1A3",    // vanilla
      background: "#FFF7ED",
      text: "#302A24",
    },
  },
  night: {
    id: "night",
    name: "Night Premium",
    colors: {
      primary: "#99C8FF",   // muted ice blue
      secondary: "#FFD08A", // premium warm gold
      accent: "#FFE9C6",    // champagne
      background: "#0E1116", // charcoal with warmth
      text: "#F5F5F5",
    },
  },
};

export const landingThemeTokens: Record<string, ThemeTokens> = {
  neutral: {
    surface: "#FFFFFF",
    surfaceSoft: "#E5E7EB",
    border: "#D1D5DB",
    mutedText: "#6B7280",

    ctaBg: "#111827",
    ctaText: "#F9FAFB",
    ctaHoverBg: "#020617",

    slotBackground: "#E5E7EB",
    slotTileBg: "#F3F4F6",
    slotTileBorder: "#D1D5DB",
    slotIcon: "#F59E0B",            // warm accent on neutral tiles
    slotCenterBg: "#111827",
    slotCenterText: "#F9FAFB",
    slotGlowPrimary: "rgba(148,163,184,0.55)",  // slate glow
    slotGlowAccent: "rgba(245,158,11,0.55)",    // warm accent glow
  },
  luxury: {
    surface: "#FFFFFF",
    surfaceSoft: "#F3E8D9",
    border: "#D6C7B2",
    mutedText: "#6B6B6B",

    ctaBg: "#C6A667",
    ctaText: "#1A1A1A",
    ctaHoverBg: "#B59555",

    // SLOT (updated)
    slotBackground: "#F2E8D9", // slightly darker to avoid wash-out
    slotTileBg: "#F5EDE0",     // improved contrast
    slotTileBorder: "#D0BFA8", // warmer, visible border
    slotIcon: "#B2843F",       // deeper gold (less pastel)
    slotCenterBg: "#E7D2B5",
    slotCenterText: "#1A1A1A",
    slotGlowPrimary: "rgba(198,166,103,0.55)",  // reduced glow for elegance
    slotGlowAccent: "rgba(238,217,183,0.55)",   // softer champagne glow
  },

  boutique: {
    surface: "#FFFFFF",
    surfaceSoft: "#EAE3D8",
    border: "#C8B8A3",
    mutedText: "#5B5B5B",

    ctaBg: "#2E6F4E",
    ctaText: "#FDFBF7",
    ctaHoverBg: "#255840",

    // SLOT
    slotBackground: "#E0D8C9",
    slotTileBg: "#EFE8DD",
    slotTileBorder: "#B69C82",
    slotIcon: "#A6773F",
    slotCenterBg: "#D8C6AB",
    slotCenterText: "#234231",
    slotGlowPrimary: "rgba(46,111,78,0.55)",
    slotGlowAccent: "rgba(214,198,174,0.7)",
  },

  mediterranean: {
    surface: "#FFFFFF",
    surfaceSoft: "#E5EEF6",
    border: "#BFD1E1",
    mutedText: "#4B5563",

    ctaBg: "#2071A6",
    ctaText: "#F9FAFB",
    ctaHoverBg: "#185882",

    // SLOT
    slotBackground: "#E4EFF7",
    slotTileBg: "#F2F7FB",
    slotTileBorder: "#C2D4E7",
    slotIcon: "#CE7A1A",
    slotCenterBg: "#F4CF83",
    slotCenterText: "#1A1A1A",
    slotGlowPrimary: "rgba(32,113,166,0.5)",
    slotGlowAccent: "rgba(244,207,131,0.65)",
  },

  cozy: {
    surface: "#FFFFFF",
    surfaceSoft: "#F6E3CF",
    border: "#EBC5A3",
    mutedText: "#6B4B3A",

    ctaBg: "#CB6E3D",
    ctaText: "#FFF7ED",
    ctaHoverBg: "#B45C30",

    // SLOT
    slotBackground: "#F8E5D3",
    slotTileBg: "#FDF2E7",
    slotTileBorder: "#E5B692",
    slotIcon: "#E27F3B",
    slotCenterBg: "#F5CE9E",
    slotCenterText: "#4B2C24",
    slotGlowPrimary: "rgba(203,110,61,0.5)",
    slotGlowAccent: "rgba(247,209,163,0.6)",
  },

  night: {
    surface: "#10131A",
    surfaceSoft: "#151924",
    border: "#283041",
    mutedText: "#9CA3AF",

    ctaBg: "#99C8FF",
    ctaText: "#020617",
    ctaHoverBg: "#7BB3F5",

    // SLOT
    slotBackground: "#0F1521",
    slotTileBg: "#161D2A",
    slotTileBorder: "#30405A",
    slotIcon: "#FFD08A",
    slotCenterBg: "#1E293B",
    slotCenterText: "#99C8FF",
    slotGlowPrimary: "rgba(153,200,255,0.8)",
    slotGlowAccent: "rgba(255,208,138,0.75)",
  },
};

export function loadLandingThemeDefaults(): Record<string, LandingThemeData> {
  const baseTokens = landingThemeTokens.neutral;

  return Object.entries(landingThemes).reduce((acc, [key, theme]) => {
    const tokens = landingThemeTokens[key] ?? baseTokens;

    acc[key] = {
      id: theme.id,
      name: theme.name,
      palette: theme.colors,
      tokens,
    };

    return acc;
  }, {} as Record<string, LandingThemeData>);
}

export const landingThemeDefaults = loadLandingThemeDefaults();
export const DEFAULT_THEME_ID = 'neutral'
