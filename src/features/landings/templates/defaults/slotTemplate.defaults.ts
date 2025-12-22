/**
 * slotTemplate - Default Values
 *
 * This file contains ONLY default data values for the slot template.
 * - Default data for blocks (if any)
 * - Default data for addon instances (if any)
 *
 * NO structure or i18n keys.
 * Those are in separate files:
 * - structure: templates/definitions/slotTemplate.ts
 * - i18n: templates/i18n/slotTemplate.i18n.ts
 *
 * IMPORTANT: Only include non-i18n default values here.
 * For i18n defaults, use the i18n map instead.
 */

import type { TemplateDefaults } from "../types";

export const slotTemplateDefaults: TemplateDefaults = {
  templateId: "slotTemplate",

  blocks: {
    // empty1 block - no default data needed
    empty1: {
      data: {},
    },

    // empty2 block - has addon with default data
    empty2: {
      data: {},
      addons: {
        // slote-banner-section addon has non-i18n default
        "slote-banner-section": {
          data: {
            showPlayButton: true, // ✅ Actual default value (not i18n)
          },
        },
      },
    },
  },
};
