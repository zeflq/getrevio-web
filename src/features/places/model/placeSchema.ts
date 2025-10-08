import { z } from "zod";
import { landingDefaultsSchema } from "@/features/landing";
// DTOs for create/update
export const placeLandingSchema = landingDefaultsSchema.extend({
  primaryCtaUrl: z.string().url("Invalid URL"),
  primaryCtaLabel: z.string().min(1, "Required"),
});

export const placeCreateSchema = z.object({
  localName: z.string().min(1, "Local name is required"),
  slug: z.string().min(1, "Slug is required"),
  address: z.string().optional(),
  merchantId: z.string().min(1, "Merchant ID is required"),
  googlePlaceId: z.string().optional(),
  landingDefaults: placeLandingSchema,
});

export const placeUpdateSchema = placeCreateSchema.extend({
  id: z.string().optional(),
});

export type PlaceCreateInput = z.infer<typeof placeCreateSchema>;
export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>;

export const placeLiteSchema = z.object({
  id: z.string(),
  localName: z.string(),
});
export type PlaceLite = z.infer<typeof placeLiteSchema>;