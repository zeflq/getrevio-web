import { SimpleHeroRenderer } from "./Renderer";
import { SimpleHeroInspector } from "./Inspector";
import { simpleHeroSchema, type SimpleHeroData } from "./schema";
import type { LandingBlockPlugin } from "../plugin";

const simpleHeroPlugin: LandingBlockPlugin<SimpleHeroData> = {
  kind: "simpleHero",
  label: "Simple Hero",
  schema: simpleHeroSchema,
  defaultData: {
    title: "",
    subtitle: "",
  },
  Renderer: SimpleHeroRenderer,
  Inspector: SimpleHeroInspector,
};

export default simpleHeroPlugin;
