import type { LandingBlockKind } from "../blocks";
import type { LandingTemplate } from "./types";

export const getTemplateMaxInstanceMap = (template?: LandingTemplate | null) => {
  const map = new Map<LandingBlockKind, number>();
  template?.blocks?.forEach((block) => {
    if (block.maxInstances !== undefined) {
      map.set(block.kind, block.maxInstances);
    }
  });
  return map;
};

export const getTemplateFixedCountMap = (template?: LandingTemplate | null) => {
  const map = new Map<LandingBlockKind, number>();
  template?.blocks?.forEach((block) => {
    if (block.mode === "fixed") {
      map.set(block.kind, (map.get(block.kind) ?? 0) + 1);
    }
  });
  return map;
};
