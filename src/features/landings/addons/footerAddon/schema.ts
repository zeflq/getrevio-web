import { z } from "zod";

export const footerAddonSchema = z.object({
  text: z.string().min(1, "Footer text is required"),
});

export type FooterAddonData = z.infer<typeof footerAddonSchema>;

export const footerAddonDefaultData: FooterAddonData = {
  text: "footer text",
};
