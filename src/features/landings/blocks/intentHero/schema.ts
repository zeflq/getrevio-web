import { z } from "zod";

export const intentHeroSchema = z.object({
  title: z.string().max(128, "Title is too long").optional(),
  subtitle: z.string().max(256, "Subtitle is too long").optional()
});

export type IntentHeroData = z.infer<typeof intentHeroSchema>;
