
import type { LandingBlockPlugin } from "../plugin";
import { SlotHeroRenderer } from "./Renderer";
import {
  slotHeroDefaultData,
  slotHeroSchema,
  type SlotHeroData
} from "./schema";

const slotHeroPlugin: LandingBlockPlugin<SlotHeroData> = {
  kind: "slotHero",
  label: "Slot hero",
  schema: slotHeroSchema,
  defaultData: slotHeroDefaultData,
  Renderer: SlotHeroRenderer,

  // No inspector → block is empty
  Inspector: () => null
};

export default slotHeroPlugin;
