import { z } from "zod";

export const instagramActionDrawerAddonSchema = z.object({
  kind: z.literal("instagramActionDrawerAddon"),
  instagramUrl: z
    .string()
    .url("Instagram URL must be a valid URL")
    .min(1, "Instagram URL is required"),
  handle: z.string().max(80, "Handle is too long").optional(),
});

export type InstagramActionDrawerAddonData = z.infer<
  typeof instagramActionDrawerAddonSchema
>;

export const instagramActionDrawerAddonDefault: InstagramActionDrawerAddonData = {
  kind: "instagramActionDrawerAddon",
  instagramUrl: "",
  handle: "",
};
