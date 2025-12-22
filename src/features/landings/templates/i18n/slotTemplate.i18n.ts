/**
 * slotTemplate - i18n Map (KIND Pattern)
 *
 * This file contains actual translations for the slot template.
 * - Portable (no dependency on messages files)
 * - Co-located with template structure
 * - Same pattern as addon/block i18n
 *
 * Structure:
 * - meta: Template name and description in all languages
 * - blocks: Block labels in all languages
 * - addons: Instance-specific overrides (optional)
 *
 * Separate files:
 * - structure: templates/definitions/slotTemplate.ts
 * - defaults: templates/defaults/slotTemplate.defaults.ts
 */

import type { TemplateI18nMap } from "../types";

export const slotTemplateI18n: TemplateI18nMap = {
  templateId: "slotTemplate",

  // Template-level metadata with actual translations
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

  // Block-level translations
  blocks: {
    empty1: {
      label: {
        en: "Page 1",
        fr: "Page 1",
        ar: "صفحة 1",
      },
    },
    empty2: {
      label: {
        en: "Page 2",
        fr: "Page 2",
        ar: "صفحة 2",
      },
    },
  },

  // Addon instance overrides
  // These override the KIND i18n for specific instances
  addons: {
    "slot-simple-title": {
      title: {
        en: "Spin to Reveal Your Gift",
        fr: "A vous de jouer !",
        ar: "أدر لتكشف عن هديتك",
      },
      subtitle: {
        en: "Get 3 matching symbols to win.",
        fr: "Obtenez 3 symboles identiques pour gagner.",
        ar: "احصل على 3 رموز متطابقة للفوز",
      },
    },
  },
} as const;
