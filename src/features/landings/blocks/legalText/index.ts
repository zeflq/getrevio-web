import { LegalTextRenderer } from "./Renderer";
import { LegalTextInspector } from "./Inspector";
import { legalTextSchema, type LegalTextData } from "./schema";
import type { LandingBlockPlugin } from "../plugin";

const legalTextPlugin: LandingBlockPlugin<LegalTextData> = {
  kind: "legalText",
  label: "Legal Text",
  schema: legalTextSchema,
  defaultData: {
    text: "",
  },
  Renderer: LegalTextRenderer,
  Inspector: LegalTextInspector,
};

export default legalTextPlugin;
