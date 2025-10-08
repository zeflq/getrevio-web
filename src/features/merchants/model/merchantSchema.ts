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

export const merchantLiteSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type MerchantLite = z.infer<typeof merchantLiteSchema>;


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