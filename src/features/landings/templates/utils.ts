import type { LandingBlockKind } from "../blocks";
import type { LandingTemplate } from "./types";

export const getTemplateMaxInstanceMap = (template?: LandingTemplate | null) => {
  const map = new Map<LandingBlockKind, number>();
  template?.blocks?.forEach((block) => {
    if (block.maxInstances !== undefined) {
      map.set(block.blockType, block.maxInstances);
    }
  });
  return map;
};

export const getTemplateFixedCountMap = (template?: LandingTemplate | null) => {
  const map = new Map<LandingBlockKind, number>();
  template?.blocks?.forEach((block) => {
    if (block.mode === "fixed") {
      map.set(block.blockType, (map.get(block.blockType) ?? 0) + 1);
    }
  });
  return map;
};
