import { z } from "zod";
import { LandingBlockSchema } from "../blocks";

const landingContentBase = z.object({
  layout: z.enum(["full", "boxed"]).default("full"),
});

const landingContentBlocks = z.array(LandingBlockSchema);

export const LandingContentSchema = landingContentBase.extend({
  blocks: landingContentBlocks.min(1, "At least one block is required"),
});

export const LandingContentCreateSchema = landingContentBase.extend({
  blocks: landingContentBlocks.default([]),
});

export type LandingBlockInput = z.input<typeof LandingBlockSchema>;
export type LandingBlockOutput = z.output<typeof LandingBlockSchema>;

export type LandingContentInput = z.input<typeof LandingContentSchema>;
export type LandingContentCreateInput = z.input<
  typeof LandingContentCreateSchema
>;
export type LandingContentOutput = z.output<typeof LandingContentSchema>;

export type LandingContent = LandingContentOutput;

export const createLandingContentDefaults = (): LandingContentInput => ({
  layout: "full",
  blocks: [],
});

export const ensureLandingContentShape = (
  value?: LandingContentCreateInput | LandingContentInput | LandingContent | null
): LandingContent => {
  const content = value ?? createLandingContentDefaults();
  return {
    layout: "full",
    blocks: Array.isArray(content.blocks) ? content.blocks : [],
  };
};