import { z } from "zod";

export const simpleTitleSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().optional(),
});

export type SimpleTitleAddonData = z.infer<typeof simpleTitleSchema>;

export const simpleTitleDefaultData: SimpleTitleAddonData = {
  title: "",
  subtitle: "",
};
