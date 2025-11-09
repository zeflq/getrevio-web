// model/shortlinkSchema.ts
import { z } from "zod";

export const shortlinkTargetSchema = z.object({
  t: z.enum(["campaign", "place"])
});

const shortlinkCommonSchema = z.object({
  merchantId: z.string().min(1),
  landingId: z.string().min(1),
  channel: z.enum(["qr", "nfc", "email", "web", "print", "custom"]).optional(),
  campaignId: z.string().optional(),
  placeId: z.string().optional(),
  active: z.boolean(),
  expiresAt: z.date().optional(), // "YYYY-MM-DD"
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
});

// === DTO / API ===
export const shortlinkBaseSchema = shortlinkCommonSchema.extend({
  code: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, "Must be URL-safe"),
});

export const shortlinkCreateSchema = shortlinkCommonSchema.extend({
  code: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});

export const shortlinkUpdateSchema = shortlinkCommonSchema.partial().extend({
  id: z.string().optional(),
  code: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});


// === FORM / UI ===
// landingId can be empty string until user selects one in the UI
export const shortlinkFormSchema = z.object({
  merchantId: z.string().min(1),
  landingId: z.string().min(1, "Landing is required"),
  channel: z.enum(["qr", "nfc", "email", "web", "print", "custom"]).optional(),
  active: z.boolean(),
  expiresAt: z.date().optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  code: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});

const shortlinkQuerySchemaRaw = z.object({
  merchantId: z.string().optional(),
  landingId: z.string().optional(),
  placeId: z.string().optional(),
  campaignId: z.string().optional(),
  channel: z
    .enum(["qr", "nfc", "email", "web", "print", "custom"])
    .optional(),
  status: z.enum(["active", "inactive"]).optional(),
  redis: z.enum(["ok", "missing", "error"]).optional(),
  q: z.string().optional(),
  _page: z.coerce.number().min(1).optional(),
  _limit: z.coerce.number().min(1).max(100).optional(),
  _sort: z
    .enum(["code", "merchantId", "channel", "createdAt", "updatedAt"])
    .optional(),
  _order: z.enum(["asc", "desc"]).optional(),
});

export const shortlinkQuerySchema = shortlinkQuerySchemaRaw;

export const shortlinkFiltersSchema = shortlinkQuerySchemaRaw.transform((params) => ({
  merchantId: params.merchantId,
  landingId: params.landingId,
  placeId: params.placeId,
  campaignId: params.campaignId,
  channel: params.channel,
  status: params.status,
  redis: params.redis,
  q: params.q,
  page: params._page ?? 1,
  pageSize: params._limit ?? 10,
  sort: params._sort ?? ("createdAt" as const),
  order: params._order ?? ("desc" as const),
}));

export type ShortlinkCreateInput = z.infer<typeof shortlinkCreateSchema>;
export type ShortlinkUpdateInput = z.infer<typeof shortlinkUpdateSchema>;
export type ShortlinkQueryParams = z.infer<typeof shortlinkQuerySchema>;
export type ShortlinkFilters = z.output<typeof shortlinkFiltersSchema>;
export type ShortlinkTargetInput = z.infer<typeof shortlinkTargetSchema>;

export type ShortlinkFormValues = z.infer<typeof shortlinkFormSchema>;
