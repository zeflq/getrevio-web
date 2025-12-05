import type { LandingAddonPlugin } from "../plugin";
import { SimpleTitleAddonInspector } from "./Inspector";
import { SimpleTitleAddonRenderer } from "./Renderer";
import { simpleTitleDefaultData, simpleTitleSchema, type SimpleTitleAddonData } from "./schema";

const simpleTitleAddonPlugin: LandingAddonPlugin<SimpleTitleAddonData> = {
  kind: "simpleTitle",
  label: "Simple title",
  schema: simpleTitleSchema,
  defaultData: simpleTitleDefaultData,
  Inspector: SimpleTitleAddonInspector,
  Renderer: SimpleTitleAddonRenderer,
};

export default simpleTitleAddonPlugin;
