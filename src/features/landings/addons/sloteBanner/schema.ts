import { z } from "zod";

export const sloteBannerSchema = z.object({
  showPlayButton: z.boolean().default(false),
});

export type SloteBannerData = z.infer<typeof sloteBannerSchema>;

export const sloteBannerDefaultData: SloteBannerData = {
  showPlayButton: false,
};
