/**
 * KIND i18n for instagramActionDrawerAddon
 *
 * This file contains portable translations for the Instagram action drawer addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const instagramActionDrawerAddonI18n = {
  kind: "instagramActionDrawerAddon",

  // Base label (default for all instances)
  label: {
    en: "Instagram Action",
    fr: "Action Instagram",
  },

  // Description (shared across instances)
  description: {
    en: "Invite visitors to follow your Instagram profile",
    fr: "Inviter les visiteurs à suivre votre profil Instagram",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Instagram Settings",
      fr: "Paramètres Instagram",
    },
    fields: {
      instagramUrl: {
        label: {
          en: "Instagram profile URL",
          fr: "URL du profil Instagram",
        },
        placeholder: {
          en: "https://instagram.com/your_place",
          fr: "https://instagram.com/votre_lieu",
        },
      },
      handle: {
        label: {
          en: "Instagram handle",
          fr: "Handle Instagram",
        },
        placeholder: {
          en: "@your_place",
          fr: "@votre_lieu",
        },
      },
    },
  },
} as const;

export type InstagramActionDrawerAddonI18n = typeof instagramActionDrawerAddonI18n;
