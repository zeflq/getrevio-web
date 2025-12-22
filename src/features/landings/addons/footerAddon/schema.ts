import { z } from "zod";

export const footerAddonSchema = z.object({
  text: z.string().default(""),
});

export type FooterAddonData = z.infer<typeof footerAddonSchema>;

export const footerAddonDefaultData: FooterAddonData = {
  text: "",
};
