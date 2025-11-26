import type { LandingAddonPlugin } from "../plugin";
import { InstagramActionDrawerAddonInspector } from "./Inspector";
import { InstagramActionDrawerAddonRenderer } from "./Renderer";
import {
  instagramActionDrawerAddonDefault,
  instagramActionDrawerAddonSchema,
  type InstagramActionDrawerAddonData,
} from "./schema";

const instagramActionDrawerAddonPlugin: LandingAddonPlugin<
  InstagramActionDrawerAddonData
> = {
  kind: "instagramActionDrawerAddon",
  label: "Instagram action drawer",
  schema: instagramActionDrawerAddonSchema,
  defaultData: instagramActionDrawerAddonDefault,
  Inspector: InstagramActionDrawerAddonInspector,
  Renderer: InstagramActionDrawerAddonRenderer,
};

export default instagramActionDrawerAddonPlugin;
export { instagramActionDrawerAddonSchema, type InstagramActionDrawerAddonData };
