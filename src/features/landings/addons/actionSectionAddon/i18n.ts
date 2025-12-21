/**
 * KIND i18n for actionSectionAddon
 *
 * This file contains portable translations for the action section addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const actionSectionAddonI18n = {
  kind: "actionSectionAddon",

  // Base label (default for all instances)
  label: {
    en: "Action section",
    fr: "Section d'action",
  },

  // Description (shared across instances)
  description: {
    en: "Highlight a CTA block with text and button",
    fr: "Mets en avant un CTA avec texte et bouton",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Action Section Settings",
      fr: "Paramètres de la section d'action",
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
      description: {
        label: {
          en: "Description",
          fr: "Description",
        },
        placeholder: {
          en: "Enter description (optional)",
          fr: "Entrez la description (optionnel)",
        },
      },
      buttonLabel: {
        label: {
          en: "Button label",
          fr: "Label du bouton",
        },
        placeholder: {
          en: "Enter button text",
          fr: "Entrez le texte du bouton",
        },
      },
    },
  },
} as const;

export type ActionSectionAddonI18n = typeof actionSectionAddonI18n;
