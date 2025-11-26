import { z } from "zod";

export const googleReviewActionDrawerAddonSchema = z.object({
  kind: z.literal("googleReviewActionDrawerAddon"),
  googleUrl: z
    .string()
    .url("Google review URL must be a valid URL")
    .min(1, "Google review URL is required"),
  placeLabel: z.string().max(80, "Place label is too long").optional(),
});

export type GoogleReviewActionDrawerAddonData = z.infer<
  typeof googleReviewActionDrawerAddonSchema
>;

export const googleReviewActionDrawerAddonDefault: GoogleReviewActionDrawerAddonData = {
  kind: "googleReviewActionDrawerAddon",
  googleUrl: "",
  placeLabel: "",
};
