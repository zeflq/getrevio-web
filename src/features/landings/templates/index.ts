import type { LandingTemplate } from "./types";

export const landingTemplates: LandingTemplate[] = [
  {
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
            hideInspector: true
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
            hideInspector: true
          },
          {
            id: "slot-game-action-drawer",
            kind: "actionsdrawerAddon",
            mode: "fixed",
            maxInstances: 1,
          },
        ],
      },
    ],
  }
];

export const getTemplateById = (id?: string | null) =>
  landingTemplates.find((template) => template.id === id);
