/**
 * KIND i18n for lotteryAddon
 *
 * This file contains portable translations for the lottery addon.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base addon label (can be overridden per instance in templates)
 * - description: Addon description (shared across instances)
 * - inspector: Inspector panel translations (shared across instances)
 *   - title: Inspector panel title
 *   - fields: Field labels and placeholders
 */

export const lotteryAddonI18n = {
  kind: "lotteryAddon",

  // Base label (default for all instances)
  label: {
    en: "Lottery",
    fr: "Loterie",
  },

  // Description (shared across instances)
  description: {
    en: "Embed a lottery game so visitors can spin and win directly from this landing.",
    fr: "Ajoutez un jeu de loterie à cette landing pour que les visiteurs puissent tenter leur chance.",
  },

  // Inspector translations (shared across all instances)
  inspector: {
    title: {
      en: "Lottery Settings",
      fr: "Paramètres de loterie",
    },
    fields: {
      lotteryId: {
        label: {
          en: "Lottery",
          fr: "Loterie",
        },
        placeholder: {
          en: "Select a lottery",
          fr: "Sélectionnez une loterie",
        },
      },
      contactMethod: {
        label: {
          en: "Contact Method",
          fr: "Méthode de contact",
        },
        placeholder: {
          en: "Select contact method",
          fr: "Sélectionnez une méthode",
        },
      },
    },
  },
} as const;

export type LotteryAddonI18n = typeof lotteryAddonI18n;
