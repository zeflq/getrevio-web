import { z } from 'zod';

export const themeCreateSchema = z.object({
  merchantId: z.string().min(1, 'Merchant is required'),
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().url('Must be a valid URL').optional(),
   brandColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color like #FF6600")
    .optional()
    .or(z.literal("")),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/,"Use hex color")
    .optional()
    .or(z.literal("")),
  textColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/,"Use hex color")
    .optional()
    .or(z.literal("")),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const themeUpdateSchema = themeCreateSchema.partial().extend({
  id: z.string().optional(),
});

export type ThemeCreateInput = z.infer<typeof themeCreateSchema>;
export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;

export interface ThemeQueryParams {
  q?: string;
  merchantId?: string;
  _page?: number;
  _limit?: number;
  _sort?: 'name' | 'createdAt';
  _order?: 'asc' | 'desc';
}

export const themeFiltersSchema = z
  .object({
    q: z.string().optional(),
    merchantId: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(['name', 'createdAt']).optional(),
    _order: z.enum(['asc', 'desc']).optional(),
  })
  .transform((params) => ({
    q: params.q,
    merchantId: params.merchantId,
    page: params._page ?? 1,
    pageSize: params._limit ?? 10,
    sort: params._sort ?? ('createdAt' as const),
    order: params._order ?? ('desc' as const),
  }));

export type ThemeFilters = z.output<typeof themeFiltersSchema>;
