import { z } from "zod";

export const actionDrawerBaseSchema = z.object({
  triggerLabel: z
    .string()
    .min(1, "Trigger label is required")
    .max(40, "Trigger label is too long"),
  title: z.string().min(1, "Title is required").max(80, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description is too long"),
  primaryLabel: z
    .string()
    .min(1, "Primary label is required")
    .max(40, "Primary label is too long"),
  footerText: z.string().max(160, "Footer text is too long").optional(),
  incentiveText: z.string().max(160, "Incentive text is too long").optional(),
});
