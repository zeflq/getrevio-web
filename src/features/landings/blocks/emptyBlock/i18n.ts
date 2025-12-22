/**
 * KIND i18n for emptyBlock
 *
 * This file contains portable translations for the empty block.
 * It separates KIND i18n (shared across all instances) from INSTANCE i18n (template-specific overrides).
 *
 * Structure:
 * - label: Base block label (can be overridden per instance in templates)
 * - description: Block description (shared across instances)
 */

export const emptyBlockI18n = {
  kind: "empty",

  // Base label (default for all instances)
  label: {
    en: "Page",
    fr: "Page",
    ar: "صفحة",
  },

  // Description (shared across instances)
  description: {
    en: "An empty container for addons",
    fr: "Un conteneur vide pour les modules",
    ar: "حاوية فارغة للوحدات",
  },
} as const;

export type EmptyBlockI18n = typeof emptyBlockI18n;
