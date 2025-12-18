import type { LandingAddonPlugin } from "../plugin";
import { WinningDrawerAddonRenderer } from "./Renderer";
import {
  winningDrawerAddonDefaultData,
  winningDrawerAddonSchema,
  type WinningDrawerAddonData,
} from "./schema";

const winningDrawerAddonPlugin: LandingAddonPlugin<WinningDrawerAddonData> = {
  kind: "winningDrawerAddon",
  label: "Winning drawer",
  schema: winningDrawerAddonSchema,
  defaultData: winningDrawerAddonDefaultData,
  Inspector: () => null,
  Renderer: WinningDrawerAddonRenderer,
};

export default winningDrawerAddonPlugin;
export { winningDrawerAddonSchema, type WinningDrawerAddonData };
