import { z } from "zod";

export const footerAddonSchema = z.object({
  text: z.string().min(1, "Footer text is required"),
  align: z.enum(["left", "center", "right"]).default("center"),
  tone: z.enum(["muted", "normal"]).default("muted"),
});

export type FooterAddonData = z.infer<typeof footerAddonSchema>;

export const footerAddonDefaultData: FooterAddonData = {
  text: "Powered by Myli",
  align: "center",
  tone: "muted",
};
