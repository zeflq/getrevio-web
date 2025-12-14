import { z } from "zod";

export const lotteryAddonSchema = z.object({
  lotteryId: z.string().optional(),
  contactMethod: z.enum(["email", "sms"]).default("email"),
});

export type LotteryAddonData = z.infer<typeof lotteryAddonSchema>;

export const lotteryAddonDefault: LotteryAddonData = {
  lotteryId: undefined,
  contactMethod: "email",
};
