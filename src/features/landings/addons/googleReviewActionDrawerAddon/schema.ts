import { z } from "zod";

export const googleReviewActionDrawerAddonSchema = z.object({
  googleUrl: z
    .string()
    .default("")
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL",
    }),
  placeLabel: z.string().max(80, "Place label is too long").optional(),
});

export type GoogleReviewActionDrawerAddonData = z.infer<
  typeof googleReviewActionDrawerAddonSchema
>;

export const googleReviewActionDrawerAddonDefault: GoogleReviewActionDrawerAddonData = {
  googleUrl: "",
  placeLabel: "",
};
