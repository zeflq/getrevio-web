import { z } from "zod";
export const placeCreateSchema = z.object({
  localName: z.string().min(1, "Local name is required"),
  address: z.string().optional(),
  merchantId: z.string().min(1, "Merchant ID is required"),
});

export const placeUpdateSchema = placeCreateSchema
  .partial();

export type PlaceCreateInput = z.infer<typeof placeCreateSchema>;
export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>;

export const placeFiltersSchema = z
  .object({
    q: z.string().optional(),
    localName: z.string().optional(),
    merchantId: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["localName", "createdAt"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
  })
  .transform((params) => ({
    q: params.q,
    localName: params.localName,
    merchantId: params.merchantId,
    page: params._page ?? 1,
    pageSize: params._limit ?? 10,
    sort: params._sort ?? ("createdAt" as const),
    order: params._order ?? ("desc" as const),
  }));

export type PlaceFilters = z.output<typeof placeFiltersSchema>;
