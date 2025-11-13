import { HeroWithCtaRenderer } from "./Renderer";
import { HeroWithCtaInspector } from "./Inspector";
import { heroWithCtaSchema, type HeroWithCtaData } from "./schema";
import type { LandingBlockPlugin } from "../plugin";

const heroWithCtaPlugin: LandingBlockPlugin<HeroWithCtaData> = {
  kind: "heroWithCta",
  label: "Hero with CTA",
  schema: heroWithCtaSchema,
  defaultData: {
    title: "",
    subtitle: "",
    ctas: [
      {
        label: "",
        url: "",
        style: "primary",
      },
    ],
  },
  Renderer: HeroWithCtaRenderer,
  Inspector: HeroWithCtaInspector,
};

export default heroWithCtaPlugin;
