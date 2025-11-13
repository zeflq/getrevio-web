import type { LandingBlockKind } from "../blocks";

export type TemplateBlockDefinition = {
  id: string;
  blockType: LandingBlockKind;
  label: string;
  mode: "fixed" | "optional";
  maxInstances?: number;
  defaultData?: Record<string, unknown>;
};

export type LandingTemplate = {
  id: string;
  name: string;
  description?: Record<"en" | "fr", string>;
  blocks: TemplateBlockDefinition[];
};
