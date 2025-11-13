import { z } from "zod";

const optionalUrlSchema = z
  .union([z.string().url("Enter a valid URL"), z.literal("")])
  .optional();

export const heroCtaSchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  url: optionalUrlSchema,
  style: z.enum(["primary", "secondary"]).default("primary"),
});

export type HeroCta = z.infer<typeof heroCtaSchema>;

export const heroWithCtaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  ctas: z.array(heroCtaSchema).min(1).max(2),
});

export type HeroWithCtaData = z.infer<typeof heroWithCtaSchema>;
