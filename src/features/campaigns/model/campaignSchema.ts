import { z } from "zod";

export const campaignCreateSchema = z.object({
  merchantId: z.string().min(1, "Merchant ID is required"),
  placeId: z.string().min(1, "Place ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  primaryCtaUrl: z.string().url("Must be a valid URL"),
  theme: z
    .object({
      brandColor: z.string().optional(),
      logoUrl: z.string().optional(),
    })
    .optional(),
  status: z.enum(["draft", "active", "archived"]),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;

export const campaignFiltersSchema = z
  .object({
    q: z.string().optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
    merchantId: z.string().optional(),
    placeId: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["name", "createdAt", "status"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
    _lite: z.coerce.boolean().optional(),
  })
  .transform((params) => ({
    q: params.q,
    status: params.status,
    merchantId: params.merchantId,
    placeId: params.placeId,
    page: params._page ?? 1,
    pageSize: params._limit ?? 10,
    sort: params._sort ?? ("createdAt" as const),
    order: params._order ?? ("desc" as const),
    lite: params._lite ?? false,
  }));

export type CampaignFilters = z.output<typeof campaignFiltersSchema>;
