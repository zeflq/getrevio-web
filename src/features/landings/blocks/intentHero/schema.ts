import { z } from "zod";

export const intentHeroSchema = z.object({
  title: z.string().max(128, "Title is too long"),
  subtitle: z.string().max(256, "Subtitle is too long").optional(),
  cta: z.object({
    label: z.string().min(1, "CTA label is required"),
  }),
  description: z.string().max(2000, "Text is too long").min(1, "Description is required"),
});

export type IntentHeroData = z.infer<typeof intentHeroSchema>;
