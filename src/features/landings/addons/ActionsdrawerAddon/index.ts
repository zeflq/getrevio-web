// actionsdrawerAddon/index.ts
import type { LandingAddonPlugin } from "../plugin";
import { ActionsdrawerAddonRenderer } from "./Renderer";
import { ActionDrawerAddonInspector } from "./Inspector";
import { drawerAddonSchema, type DrawerAddonData } from "./schema";
import { googleReviewActionDrawerAddonDefault } from "../googleReviewActionDrawerAddon/schema";

const actionsdrawerAddonDefault: DrawerAddonData = {
  provider: "googleReviewActionDrawerAddon",
  config: googleReviewActionDrawerAddonDefault,
};

const actionsdrawerAddonPlugin: LandingAddonPlugin<DrawerAddonData> = {
  kind: "actionsdrawerAddon",
  label: "Action drawer",
  schema: drawerAddonSchema,
  defaultData: actionsdrawerAddonDefault,
  Inspector: ActionDrawerAddonInspector,
  Renderer: ActionsdrawerAddonRenderer,
};

export default actionsdrawerAddonPlugin;
export type { DrawerAddonData };
