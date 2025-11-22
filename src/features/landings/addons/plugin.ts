import type * as React from "react";
import type { z } from "zod";

export type LandingAddonInspectorProps = {
  blockIndex: number;
  addonIndex: number;
  disabled?: boolean;
  /**
   * Base path pointing to the addon data inside the landing form.
   * It should look like `content.blocks.<blockIndex>.addons.<addonIndex>.data`.
   */
  fieldName: string;
};

export interface LandingAddonPlugin<T extends Record<string, unknown>> {
  kind: string;
  label: string;
  schema: z.ZodType<T>;
  defaultData: T;
  Renderer: React.FC<{ data: T }>;
  Inspector: React.FC<LandingAddonInspectorProps>;
}
