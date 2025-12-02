import type { LandingAddonPlugin } from "../plugin";
import { SloteBannerRenderer } from "./Renderer";
import { sloteBannerDefaultData, sloteBannerSchema, type SloteBannerData } from "./schema";

const sloteBannerPlugin: LandingAddonPlugin<SloteBannerData> = {
  kind: "sloteBanner",
  label: "Slot Banner addon",
  schema: sloteBannerSchema,
  defaultData: sloteBannerDefaultData,
  Inspector: () => null,
  Renderer: SloteBannerRenderer,
};

export default sloteBannerPlugin;
