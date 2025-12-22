/**
 * slotTemplate - Default Values (with Locale Support)
 *
 * This file contains default data values for the slot template.
 * Supports TWO patterns:
 * 1. Locale-based: { title: { en: "...", fr: "..." } }
 * 2. Primitives: { showPlayButton: true }
 *
 * Separate files:
 * - structure: templates/definitions/slotTemplate.ts
 * - meta: templates/meta/slotTemplate.meta.ts
 */

import type { TemplateDefaults } from "../types";

export const slotTemplateDefaults: TemplateDefaults = {
  templateId: "slotTemplate",

  blocks: {
    // empty1 block
    empty1: {
      data: {},
      addons: {
        // action-section(id in the template) addon with locale-based field data
        "action-section": {
          data: {
            // Locale-based text fields
            title: {
              en: "Spin to reveal your gift",
              fr: "Plongez dans l’univers des slots",
              ar: "",
            },
            subtitle:{
              en: "Spin to reveal your gift",
              fr: "Faites tourner les rouleaux et débloquez des bonus exclusifs",
            },
            description: {
              en: "Spin to reveal your gift",
              fr: "Un tour peut tout changer. Serez-vous le prochain gagnant ?",
            },
            buttonLabel: {
              en: "I'll try my luck",
              fr: "Je tente ma chance",
            },
          },
        },
        "slot-game-footer": {
          data: {
            // Primitive value (not locale-based)
            text:{
              en: "© 2026 GetRevio. All rights reserved.",  
              fr: "© 2026 GetRevio. Tous droits réservés."
            }
          },
        },
      },
    },

    // empty2 block
    empty2: {
      data: {},
      addons: {
        // slot-simple-title addon with locale-based field data
        "slot-simple-title": {
          data: {
            title: {
              en: "Spin to Reveal Your Gift",
              fr: "A vous de jouer !!!!",
            },
            subtitle: {
              en: "Get 3 matching symbols to win.",
              fr: "Obtenez 3 symboles identiques pour gagner.",
            },
          },
        },
        // slote-banner-section addon with primitive config
        "slote-banner-section": {
          data: {
            showPlayButton: true, // ✅ Primitive value (not locale-based)
          },
        },
      },
    },
  },
};
