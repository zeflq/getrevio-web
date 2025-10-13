import { z } from "zod";

// Allow "" or undefined, but output undefined; otherwise a valid email string.
const emailSchema = z
  .union([z.string().trim().email("Invalid email address"), z.literal(""), z.undefined()])
  .transform((v) => (v ? v : undefined));

// Allow "" or undefined, but output undefined; otherwise enforce en-US / fr_FR, etc.
const localeSchema = z
  .union([
    z
      .string()
      .trim()
      .regex(/^[a-z]{2}[-_][A-Z]{2}$/, "Use format like en-US or fr_FR"),
    z.literal(""),
    z.undefined(),
  ])
  .transform((v) => (v ? v : undefined));

export const merchantCreateSchema = z.object({
  // id is server-generated; don't require it for create
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: emailSchema,     // => string | undefined after transform
  locale: localeSchema,   // => string | undefined after transform
  plan: z.enum(["free", "pro", "enterprise"]),
  status: z.enum(["active", "suspended"]),
});

// For update, make all fields optional (id optional if you send it in body)
export const merchantUpdateSchema = merchantCreateSchema.partial().extend({
  id: z.string().optional(),
});

export type MerchantCreateInput = z.infer<typeof merchantCreateSchema>;
export type MerchantUpdateInput = z.infer<typeof merchantUpdateSchema>;

export interface MerchantQueryParams {
  q?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  _page?: number;
  _limit?: number;
  _sort?: 'name' | 'createdAt' | 'plan' | 'status';
  _order?: 'asc' | 'desc';
  _lite?: boolean;
}

/** Accepts your current front params, outputs normalized filters */
export const merchantFiltersSchema = z
  .object({
    q: z.string().optional(),
    plan: z.enum(["free", "pro", "enterprise"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),

    // current names you use on the front:
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["name", "createdAt", "plan", "status"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
    _lite: z.coerce.boolean().optional(),
  })
  .transform((p) => ({
    q: p.q,
    plan: p.plan,
    status: p.status,
    page: p._page ?? 1,
    pageSize: p._limit ?? 10,
    sort: p._sort ?? "createdAt" as const,
    order: p._order ?? "desc" as const,
    lite: p._lite ?? false,
  }));

/** The normalized server type your queries will use */
export type MerchantFilters = z.output<typeof merchantFiltersSchema>;
