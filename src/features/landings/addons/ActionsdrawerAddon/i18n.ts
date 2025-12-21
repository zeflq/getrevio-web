/**
 * KIND i18n for actionsdrawerAddon
 *
 * This file contains portable translations for the actions drawer addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const actionsdrawerAddonI18n = {
  kind: "actionsdrawerAddon",

  // Base label (default for all instances)
  label: {
    en: "Social interactions",
    fr: "Interactions sociales",
  },

  // Description (shared across instances)
  description: {
    en: "Highlight Google or Instagram reviews.",
    fr: "Mettre en avant les avis Google ou Instagram.",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Social Actions Settings",
      fr: "Paramètres des interactions sociales",
    },
    fields: {
      provider: {
        label: {
          en: "Drawer type",
          fr: "Type d'action",
        },
        placeholder: {
          en: "Select drawer type",
          fr: "Sélectionnez un type",
        },
      },
    },
    messages: {
      noKindSelected: {
        en: "No action type selected.",
        fr: "Veuillez sélectionner un type d'action.",
      },
    },
    options: {
      provider: {
        googleReview: {
          en: "Google Review",
          fr: "Avis Google",
        },
        instagram: {
          en: "Instagram",
          fr: "Instagram",
        },
      },
    },
  },
} as const;

export type ActionsdrawerAddonI18n = typeof actionsdrawerAddonI18n;
