/**
 * slotTemplate - Meta (KIND i18n Overrides)
 *
 * This file contains label/description overrides for KIND i18n.
 * - Blocks: Override emptyBlockI18n.label
 * - Addons: Override addon KIND i18n (lotteryAddonI18n, etc.)
 *
 * Does NOT contain field data - that goes in defaults.
 *
 * Separate files:
 * - structure: templates/definitions/slotTemplate.ts
 * - defaults: templates/defaults/slotTemplate.defaults.ts (with locale support)
 */

import type { TemplateMeta } from "../types";

export const slotTemplateMeta: TemplateMeta = {
  templateId: "slotTemplate",

  // Template-level metadata
  meta: {
    name: {
      en: "Slot game Reloaded",
      fr: "Slot game Reloaded",
      ar: "لعبة السلوت المعاد تحميلها",
    },
    description: {
      en: "A template optimized for game landings",
      fr: "Un modèle optimisé pour les landings de jeux",
      ar: "قالب محسّن لصفحات الألعاب",
    },
  },

  // Block-level meta (label overrides for KIND i18n)
  blocks: {
    empty1: {
      label: {
        en: "Page 1",
        fr: "Page 1",
        ar: "صفحة 1",
      },
      description: {
        en: "First page of the slot game landing",
        fr: "Première page de la landing de jeu de slot",
      },
    },
    empty2: {
      label: {
        en: "Page 2",
        fr: "Page 2",
        ar: "صفحة 2",
      },
      description: {
        en: "Second page of the slot game landing",
        fr: "Deuxième page de la landing de jeu de slot",
      },
      // No addon meta needed - all addons use their KIND i18n
    },
  },
} as const;
