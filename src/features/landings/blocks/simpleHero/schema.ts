import { z } from "zod";

export const simpleHeroSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
});

export type SimpleHeroData = z.infer<typeof simpleHeroSchema>;
