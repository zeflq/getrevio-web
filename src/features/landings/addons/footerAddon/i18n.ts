/**
 * KIND i18n for footerAddon
 *
 * This file contains portable translations for the footer addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const footerAddonI18n = {
  kind: "footerAddon",

  // Base label (default for all instances)
  label: {
    en: "Footer",
    fr: "Pied de page",
  },

  // Description (shared across instances)
  description: {
    en: "Display a footer section with logo, links, or legal information.",
    fr: "Affiche une section de bas de page avec liens ou mentions légales.",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Footer Settings",
      fr: "Paramètres du pied de page",
    },
    fields: {
      text: {
        label: {
          en: "Footer text",
          fr: "Texte du pied de page",
        },
        placeholder: {
          en: "Add footer copy",
          fr: "Ajoutez le texte du footer",
        },
      },
    },
  },
} as const;

export type FooterAddonI18n = typeof footerAddonI18n;
