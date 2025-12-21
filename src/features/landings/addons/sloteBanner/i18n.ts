/**
 * KIND i18n for sloteBanner
 *
 * This file contains portable translations for the slote banner addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const sloteBannerI18n = {
  kind: "sloteBanner",

  // Base label (default for all instances)
  label: {
    en: "Slote Banner",
    fr: "Slote Banner",
  },

  // Description (shared across instances)
  description: {
    en: "Display a banner section for slots game promotion",
    fr: "Afficher une bannière pour la promotion du jeu de machine à sous",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Banner Settings",
      fr: "Paramètres de la bannière",
    },
    fields: {
      showPlayButton: {
        label: {
          en: "Show Play Button",
          fr: "Afficher le bouton Jouer",
        },
      },
    },
  },
} as const;

export type SloteBannerI18n = typeof sloteBannerI18n;
