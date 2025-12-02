import { z } from "zod";

// Block with no data
export const sloteBannerSchema = z.object({});

export type SloteBannerData = z.infer<typeof sloteBannerSchema>;

// No defaults needed — sloteBanner is enough
export const sloteBannerDefaultData: SloteBannerData = {};
