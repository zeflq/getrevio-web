import type { LandingBlockKind } from "../blocks";
import type { LandingBlockAddonDefinition } from "@/features/landings/addons";

export type TemplateBlockDefinition = {
  id: string;
  kind: LandingBlockKind;
  mode: "fixed" | "optional";
  maxInstances?: number;
  defaultData?: Record<string, unknown>;
  addons?: LandingBlockAddonDefinition[];
};

export type LandingTemplate = {
  id: string;
  blocks: TemplateBlockDefinition[];
};
