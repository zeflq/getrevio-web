import type { LandingTemplate } from "./types";
const I18N_PREFIX = "i18n:templates.";

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
            defaultData:{
              title: `${I18N_PREFIX}slotTemplate.defaultValues.empty2.addons.slot-simple-title.title`,
              subtitle: `${I18N_PREFIX}slotTemplate.defaultValues.empty2.addons.slot-simple-title.subtitle`
            }
          },
          {
            id: "slote-banner-section",
            kind: "sloteBanner",
            mode: "fixed",
            maxInstances: 1,
            hideInspector: true,
            defaultData:{
              showPlayButton: true
            }
          },
          {
            id: "lottery-section",
            kind: "lotteryAddon",
            mode: "fixed",
            maxInstances: 1,
          },
        ],
      }
    ],
  }
];

export const getTemplateById = (id?: string | null) =>
  landingTemplates.find((template) => template.id === id);
