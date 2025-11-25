import type { LandingAddonPlugin } from "../plugin";
import { ActionsdrawerAddonRenderer } from "./Renderer";
import { ActionDrawerAddonInspector } from "./Inspector";
import { drawerAddonSchema, type DrawerAddonData } from "./schema";
import { googleReviewActionDrawerDefault } from "../googleReviewActionDrawer/schema";
import { instagramActionDrawerDefault } from "../instagramActionDrawer/schema";

const actionsdrawerAddonDefault: DrawerAddonData = {
  kind: "drawer",
  triggerLabel: "Open drawer",
  title: "Explore actions",
  description: "Highlight reviews or your social profile.",
  incentiveText: "Tap to see what you can do next.",
  primaryLabel: "Open drawer",
  footerText: "Thanks for checking us out.",
  drawer: instagramActionDrawerDefault,
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
