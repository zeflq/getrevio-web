import type { LandingAddonPlugin } from "../plugin";
import { LotteryAddonInspector } from "./Inspector";
import { LotteryAddonRenderer } from "./Renderer";
import { lotteryAddonDefault, lotteryAddonSchema, type LotteryAddonData } from "./schema";

const lotteryAddonPlugin: LandingAddonPlugin<LotteryAddonData> = {
  kind: "lotteryAddon",
  label: "Lottery",
  schema: lotteryAddonSchema,
  defaultData: lotteryAddonDefault,
  Inspector: LotteryAddonInspector,
  Renderer: LotteryAddonRenderer,
};

export default lotteryAddonPlugin;
