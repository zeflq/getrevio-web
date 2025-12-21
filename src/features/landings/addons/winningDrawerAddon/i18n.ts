/**
 * KIND i18n for winningDrawerAddon
 *
 * This file contains portable translations for the winning drawer addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Note: This addon typically has hideInspector: true, but we provide translations for completeness.
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances, if ever shown)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const winningDrawerAddonI18n = {
  kind: "winningDrawerAddon",

  // Base label (default for all instances)
  label: {
    en: "Winning Drawer",
    fr: "Tiroir de victoire",
  },

  // Description (shared across instances)
  description: {
    en: "Display a winning celebration drawer",
    fr: "Afficher un tiroir de célébration de victoire",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Winning Drawer Settings",
      fr: "Paramètres du tiroir de victoire",
    },
    fields: {
      title: {
        label: {
          en: "Title",
          fr: "Titre",
        },
        placeholder: {
          en: "Enter winning title",
          fr: "Entrez le titre de victoire",
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
      successMessage: {
        label: {
          en: "Success Message",
          fr: "Message de succès",
        },
        placeholder: {
          en: "Enter success message (optional)",
          fr: "Entrez le message de succès (optionnel)",
        },
      },
    },
  },
} as const;

export type WinningDrawerAddonI18n = typeof winningDrawerAddonI18n;
