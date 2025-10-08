import { z } from "zod";

export const landingDefaultsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  primaryCtaLabel: z.string().optional(),
  primaryCtaUrl: z.string().url().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaUrl: z.string().url().optional(),
});
export type LandingDefaults = z.infer<typeof landingDefaultsSchema>;
