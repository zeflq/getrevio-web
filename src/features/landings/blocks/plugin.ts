import type * as React from "react";
import type { z } from "zod";

export type LandingBlockInspectorProps = {
  index: number;
  disabled?: boolean;
  belongsTo?: { type: "place" | "campaign"; placeId?: string; campaignId?: string } | null;
  landing?: { name?: string | null } | null;
};

export interface LandingBlockPlugin<T extends Record<string, unknown>> {
  kind: string;
  label: string;
  schema: z.ZodType<T>;
  defaultData: T;
  Renderer: React.FC<{ data: T }>;
  Inspector: React.FC<LandingBlockInspectorProps>;
}
