import { z } from "zod";

export const instagramActionDrawerAddonSchema = z.object({
  instagramUrl: z
    .string()
    .default("")
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL",
    }),
  handle: z.string().max(80, "Handle is too long").optional(),
});

export type InstagramActionDrawerAddonData = z.infer<
  typeof instagramActionDrawerAddonSchema
>;

export const instagramActionDrawerAddonDefault: InstagramActionDrawerAddonData = {
  instagramUrl: "",
  handle: "",
};
