import type { LandingBlockPlugin } from "../plugin";
import { IntentHeroRenderer } from "./Renderer";
import { IntentHeroInspector } from "./Inspector";
import { intentHeroDefaultData, intentHeroSchema, type IntentHeroData } from "./schema";

const intentHeroPlugin: LandingBlockPlugin<IntentHeroData> = {
  kind: "intentHero",
  label: "Intent Hero",
  schema: intentHeroSchema,
  defaultData: intentHeroDefaultData,
  Renderer: IntentHeroRenderer,
  Inspector: IntentHeroInspector,
};

export default intentHeroPlugin;
