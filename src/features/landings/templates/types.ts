import type { LandingBlockKind } from "../blocks";
import type { LandingBlockAddonDefinition } from "@/features/landings/addons";

export type TemplateBlockDefinition = {
  id: string;
  blockType: LandingBlockKind;
  label: string;
  mode: "fixed" | "optional";
  maxInstances?: number;
  defaultData?: Record<string, unknown>;
  addons?: LandingBlockAddonDefinition[];
};

export type LandingTemplate = {
  id: string;
  name: string;
  description?: Record<"en" | "fr", string>;
  blocks: TemplateBlockDefinition[];
};
