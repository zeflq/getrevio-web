import { z } from "zod";

export const winningDrawerAddonSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  successMessage: z.string().optional(),
});

export type WinningDrawerAddonData = z.infer<typeof winningDrawerAddonSchema>;

export const winningDrawerAddonDefaultData: WinningDrawerAddonData = {};
