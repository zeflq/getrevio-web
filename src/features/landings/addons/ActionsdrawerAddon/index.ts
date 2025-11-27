import type { LandingAddonPlugin } from "../plugin";
import { ActionsdrawerAddonRenderer } from "./Renderer";
import { ActionDrawerAddonInspector } from "./Inspector";
import { drawerAddonSchema, type DrawerAddonData } from "./schema";
import { googleReviewActionDrawerAddonDefault } from "../googleReviewActionDrawerAddon/schema";
//import { instagramActionDrawerAddonDefault } from "../instagramActionDrawerAddon/schema";

const actionsdrawerAddonDefault: DrawerAddonData = {
  kind: "drawer",
  drawer: googleReviewActionDrawerAddonDefault,
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
export { drawerAddonSchema };
export type { DrawerAddonData };
