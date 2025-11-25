import type { LandingAddonPlugin } from "../plugin";
import { InstagramActionDrawerInspector } from "./Inspector";
import { InstagramActionDrawerRenderer } from "./Renderer";
import {
  instagramActionDrawerDefault,
  instagramActionDrawerSchema,
  type InstagramActionDrawerData,
} from "./schema";

const instagramActionDrawerPlugin: LandingAddonPlugin<
  InstagramActionDrawerData
> = {
  kind: "instagramActionDrawer",
  label: "Instagram action drawer",
  schema: instagramActionDrawerSchema,
  defaultData: instagramActionDrawerDefault,
  Inspector: InstagramActionDrawerInspector,
  Renderer: InstagramActionDrawerRenderer,
};

export default instagramActionDrawerPlugin;
export { instagramActionDrawerSchema, type InstagramActionDrawerData };
