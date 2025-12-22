import { z } from "zod";

export const actionSectionAddonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonLabel: z.string().min(1, "Button label is required"),
});

export type ActionSectionAddonData = z.infer<typeof actionSectionAddonSchema>;

export const actionSectionAddonDefault: ActionSectionAddonData = {
  title: "Action Section Title",
  subtitle: "Action Section Subtitle",
  description: "Action Section Description",
  buttonLabel: "Action Button Label",
};
