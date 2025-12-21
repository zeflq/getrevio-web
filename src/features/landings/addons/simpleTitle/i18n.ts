/**
 * KIND i18n for simpleTitle
 *
 * This file contains portable translations for the simple title addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const simpleTitleI18n = {
  kind: "simpleTitle",

  // Base label (default for all instances)
  label: {
    en: "Simple title",
    fr: "Titre simple",
  },

  // Description (shared across instances)
  description: {
    en: "Show a bold heading with optional supporting copy.",
    fr: "Affiche un titre centré avec un texte d'accompagnement optionnel.",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Title Settings",
      fr: "Paramètres du titre",
    },
    fields: {
      title: {
        label: {
          en: "Title",
          fr: "Titre",
        },
        placeholder: {
          en: "Enter title",
          fr: "Entrez le titre",
        },
      },
      subtitle: {
        label: {
          en: "Subtitle",
          fr: "Sous-titre",
        },
        placeholder: {
          en: "Enter subtitle (optional)",
          fr: "Entrez le sous-titre (optionnel)",
        },
      },
    },
  },
} as const;

export type SimpleTitleI18n = typeof simpleTitleI18n;
