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

export const placeFiltersSchema = z
  .object({
    q: z.string().optional(),
    merchantId: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["localName", "createdAt"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
  })
  .transform((params) => ({
    q: params.q,
    merchantId: params.merchantId,
    page: params._page ?? 1,
    pageSize: params._limit ?? 10,
    sort: params._sort ?? ("createdAt" as const),
    order: params._order ?? ("desc" as const),
  }));

export type PlaceFilters = z.output<typeof placeFiltersSchema>;
