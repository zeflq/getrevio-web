// model/shortlinkSchema.ts
import { z } from "zod";

export const shortlinkTargetSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("campaign"), cid: z.string().min(1) }),
  z.object({ t: z.literal("place"), pid: z.string().min(1) }),
]);

const shortlinkCommonSchema = z.object({
  merchantId: z.string().min(1),
  target: shortlinkTargetSchema, // ⬅️ API/DTO: requis (non null)
  channel: z.enum(["qr", "nfc", "email", "web", "print", "custom"]).optional(),
  themeId: z.string().optional(),
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
// target nullable pour permettre defaultValue = null en création
export const shortlinkFormSchema = z.object({
  merchantId: z.string().min(1),
  target: shortlinkTargetSchema.nullable(), // ⬅️ UI: peut être null tant que non choisi
  channel: z.enum(["qr", "nfc", "email", "web", "print", "custom"]).optional(),
  themeId: z.string().optional(),
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
})
.superRefine((v, ctx) => {
  // on veut que l’utilisateur choisisse un target avant submit
  if (v.target === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["target"], message: "Select a target type" });
  }
});

const shortlinkQuerySchemaRaw = z.object({
  merchantId: z.string().optional(),
  target: z.enum(["campaign", "place", "url"]).optional(),
  pid: z.string().optional(),
  cid: z.string().optional(),
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
  target: params.target,
  pid: params.pid,
  cid: params.cid,
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

export type ShortlinkFormValues = z.infer<typeof shortlinkFormSchema>; // target: union | null
