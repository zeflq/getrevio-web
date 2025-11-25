import { z } from "zod";
import { actionDrawerBaseSchema } from "../schemas/actionDrawerBase";

export const googleReviewActionDrawerSchema = actionDrawerBaseSchema.extend({
  kind: z.literal("google-review"),
  googleUrl: z
    .string()
    .url("Google review URL must be a valid URL")
    .min(1, "Google review URL is required"),
  placeLabel: z.string().max(80, "Place label is too long").optional(),
});

export type GoogleReviewActionDrawerData = z.infer<
  typeof googleReviewActionDrawerSchema
>;

export const googleReviewActionDrawerDefault: GoogleReviewActionDrawerData = {
  kind: "google-review",
  googleUrl: "",
  triggerLabel: "",
  title: "",
  description: "",
  incentiveText: "",
  primaryLabel: "",
  footerText: "",
  placeLabel: "",
};
