import { z } from "zod";

export const simpleTitleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
});

export type SimpleTitleAddonData = z.infer<typeof simpleTitleSchema>;

export const simpleTitleDefaultData: SimpleTitleAddonData = {
  title: "",
  subtitle: "",
};
