import { z } from "zod";
import { actionDrawerBaseSchema } from "../schemas/actionDrawerBase";

export const instagramActionDrawerSchema = actionDrawerBaseSchema.extend({
  kind: z.literal("instagram"),
  instagramUrl: z
    .string()
    .url("Instagram URL must be a valid URL")
    .min(1, "Instagram URL is required"),
  handle: z.string().max(80, "Handle is too long").optional(),
});

export type InstagramActionDrawerData = z.infer<
  typeof instagramActionDrawerSchema
>;

export const instagramActionDrawerDefault: InstagramActionDrawerData = {
  kind: "instagram",
  instagramUrl: "",
  handle: "",
  triggerLabel: "",
  title: "",
  description: "",
  incentiveText: "",
  primaryLabel: "",
  footerText: "",
};
