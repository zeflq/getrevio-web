import { z } from "zod";

// Block with no data
export const slotHeroSchema = z.object({});

export type SlotHeroData = z.infer<typeof slotHeroSchema>;

// No defaults needed — empty is enough
export const slotHeroDefaultData: SlotHeroData = {};
