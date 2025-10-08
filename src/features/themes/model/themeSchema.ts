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
  meta: z.record(z.string(), z.any()).optional(),
});

export const themeUpdateSchema = themeCreateSchema.partial().extend({
  id: z.string().optional(),
});

export type ThemeCreateInput = z.infer<typeof themeCreateSchema>;
export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;

export type ThemeLite = { id: string; name: string };
export interface ThemeQueryParams {
  q?: string;
  merchantId?: string;
  _page?: number;
  _limit?: number;
  _sort?: 'name' | 'createdAt';
  _order?: 'asc' | 'desc';
}