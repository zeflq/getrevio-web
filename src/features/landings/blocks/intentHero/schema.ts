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

export const intentHeroDefaultData: IntentHeroData = {
  title: "Ready to playyyy?",
  subtitle: "Give it a spin and try your luck",
  cta: {
    label: "Je tente ma chance",
  },
  description: "Lancer la machine et tenter de gagner des lots incroyables !!",
};
