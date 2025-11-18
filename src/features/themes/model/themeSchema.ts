import { z } from "zod";
import { landingThemes } from "@/features/landings/theme/themes";

const presetKeys = z.enum(Object.keys(landingThemes) as [string, ...string[]]);

const paletteSchema = z.object({
  primary: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color like #1E1E1E"),
  secondary: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  accent: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  background: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  text: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
});

const tokensSchema = z.object({
  surface: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  surfaceSoft: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  border: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  mutedText: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  ctaBg: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  ctaText: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  ctaHoverBg: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotBackground: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotTileBg: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotTileBorder: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotIcon: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotCenterBg: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotCenterText: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use hex color"),
  slotGlowPrimary: z.string(),
  slotGlowAccent: z.string(),
});

const themeMetaSchema = z.object({
  presetKey: presetKeys,
  palette: paletteSchema,
  tokens: tokensSchema,
});

export const themeCreateSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  meta: themeMetaSchema,
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
