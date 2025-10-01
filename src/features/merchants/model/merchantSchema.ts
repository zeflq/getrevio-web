import { z } from 'zod';

export const merchantCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  locale: z.string().optional(),
  plan: z.enum(['free', 'pro', 'enterprise']),
  status: z.enum(['active', 'suspended']),
});

export const merchantUpdateSchema = merchantCreateSchema.partial();

export type MerchantCreateInput = z.infer<typeof merchantCreateSchema>;
export type MerchantUpdateInput = z.infer<typeof merchantUpdateSchema>;