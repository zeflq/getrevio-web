/**
 * KIND i18n for googleReviewActionDrawerAddon
 *
 * This file contains portable translations for the Google Review action drawer addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const googleReviewActionDrawerAddonI18n = {
  kind: "googleReviewActionDrawerAddon",

  // Base label (default for all instances)
  label: {
    en: "Google Review Action",
    fr: "Action Avis Google",
  },

  // Description (shared across instances)
  description: {
    en: "Prompt visitors to leave a Google review with an incentive",
    fr: "Inviter les visiteurs à laisser un avis Google avec une incitation",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Google Review Settings",
      fr: "Paramètres Avis Google",
    },
    fields: {
      googleUrl: {
        label: {
          en: "Google review URL",
          fr: "URL d'avis Google",
        },
        placeholder: {
          en: "https://search.google.com/local/writereview?placeid=...",
          fr: "https://search.google.com/local/writereview?placeid=...",
        },
      },
      placeLabel: {
        label: {
          en: "Place label",
          fr: "Label du lieu",
        },
        placeholder: {
          en: "Optional location name",
          fr: "Nom du lieu (optionnel)",
        },
      },
    },
  },
} as const;

export type GoogleReviewActionDrawerAddonI18n = typeof googleReviewActionDrawerAddonI18n;
