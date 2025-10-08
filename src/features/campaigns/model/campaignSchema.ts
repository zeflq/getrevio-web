import { z } from 'zod';

export const campaignCreateSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  placeId: z.string().min(1, 'Place ID is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  primaryCtaUrl: z.string().url('Must be a valid URL'),
  theme: z
    .object({
      brandColor: z.string().optional(),
      logoUrl: z.string().optional(),
    })
    .optional(),
  status: z.enum(['draft', 'active', 'archived']),
});

export const campaignUpdateSchema = campaignCreateSchema.partial();

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export interface CampaignQueryParams {
  q?: string;
  status?: 'draft' | 'active' | 'archived';
  merchantId?: string;
  placeId?: string;
  _page?: number;
  _limit?: number;
  _sort?: 'name' | 'createdAt' | 'status';
  _order?: 'asc' | 'desc';
}

export const campaignLiteSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type CampaignLite = z.infer<typeof campaignLiteSchema>;

