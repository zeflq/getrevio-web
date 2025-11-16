import type { LandingBlockPlugin } from "../plugin";
import { IntentHeroRenderer } from "./Renderer";
import { IntentHeroInspector } from "./Inspector";
import { intentHeroSchema, type IntentHeroData } from "./schema";

const intentHeroPlugin: LandingBlockPlugin<IntentHeroData> = {
  kind: "intentHero",
  label: "Intent Hero",
  schema: intentHeroSchema,
  defaultData: {
    title: "Ready to play?",
    subtitle: "Give it a spin and try your luck",
    cta: {
      label: "Je tente ma chance",
      url: "",
    },
  },
  Renderer: IntentHeroRenderer,
  Inspector: IntentHeroInspector,
};

export default intentHeroPlugin;
