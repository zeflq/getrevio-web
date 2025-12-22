/**
 * slotTemplate - Structure Definition
 *
 * This file contains ONLY the structural definition of the slot template:
 * - Block configuration (id, kind, mode, maxInstances)
 * - Addon configuration (id, kind, mode, maxInstances, hideInspector)
 *
 * NO i18n keys or default data values.
 * Those are in separate files:
 * - i18n: templates/i18n/slotTemplate.i18n.ts
 * - defaults: templates/defaults/slotTemplate.defaults.ts
 */

import type { TemplateDefinition } from "../types";

export const slotTemplateDefinition: TemplateDefinition = {
  id: "slotTemplate",

  blocks: [
    {
      id: "empty1",
      kind: "empty",
      mode: "fixed",
      maxInstances: 1,
      addons: [
        {
          id: "slote-banner-section",
          kind: "sloteBanner",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true,
        },
        {
          id: "action-section",
          kind: "actionSectionAddon",
          mode: "fixed",
          maxInstances: 1,
        },
        {
          id: "slot-game-footer",
          kind: "footerAddon",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true,
        },
        {
          id: "slot-game-action-drawer",
          kind: "actionsdrawerAddon",
          mode: "fixed",
          maxInstances: 1,
        },
      ],
    },
    {
      id: "empty2",
      kind: "empty",
      mode: "fixed",
      maxInstances: 1,
      addons: [
        {
          id: "slot-simple-title",
          kind: "simpleTitle",
          mode: "fixed",
          maxInstances: 1,
        },
        {
          id: "slote-banner-section",
          kind: "sloteBanner",
          mode: "fixed",
          maxInstances: 1,
          hideInspector: true,
        },
        {
          id: "lottery-section",
          kind: "lotteryAddon",
          mode: "fixed",
          maxInstances: 1,
        },
        {
          id: "slot-winning-drawer",
          kind: "winningDrawerAddon",
          mode: "fixed",
          hideInspector: true,
          maxInstances: 1,
        },
      ],
    },
  ],
};
