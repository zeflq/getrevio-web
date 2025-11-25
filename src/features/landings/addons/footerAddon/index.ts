import type { LandingAddonPlugin } from "../plugin";
import { FooterAddonInspector } from "./Inspector";
import { FooterAddonRenderer } from "./Renderer";
import { footerAddonDefaultData, footerAddonSchema, type FooterAddonData } from "./schema";

const footerAddonPlugin: LandingAddonPlugin<FooterAddonData> = {
  kind: "footerAddon",
  label: "Footer addon",
  schema: footerAddonSchema,
  defaultData: footerAddonDefaultData,
  Inspector: FooterAddonInspector,
  Renderer: FooterAddonRenderer,
};

export default footerAddonPlugin;
