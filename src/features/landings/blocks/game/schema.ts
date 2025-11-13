import { z } from "zod";

export const gameSchema = z.object({
  ctaLabel: z.string().optional(),
  linkedCampaignId: z.string().optional(),
  linkedPlaceId: z.string().optional(),
});

export type GameData = z.infer<typeof gameSchema>;
