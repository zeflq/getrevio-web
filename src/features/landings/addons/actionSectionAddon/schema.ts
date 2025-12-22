import { z } from "zod";

export const actionSectionAddonSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonLabel: z.string().default(""),
});

export type ActionSectionAddonData = z.infer<typeof actionSectionAddonSchema>;

export const actionSectionAddonDefault: ActionSectionAddonData = {
  title: "",
  subtitle: "",
  description: "",
  buttonLabel: "",
};
