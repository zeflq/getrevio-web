// actionsdrawerAddon/schema.ts
import { z } from "zod";

import {
  googleReviewActionDrawerAddonSchema,
  type GoogleReviewActionDrawerAddonData,
} from "../googleReviewActionDrawerAddon/schema";
import {
  instagramActionDrawerAddonSchema,
  type InstagramActionDrawerAddonData,
} from "../instagramActionDrawerAddon/schema";

// Discriminant au niveau du wrapper: "provider"
export const drawerAddonSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("googleReviewActionDrawerAddon"),
    config: googleReviewActionDrawerAddonSchema,
  }),
  z.object({
    provider: z.literal("instagramActionDrawerAddon"),
    config: instagramActionDrawerAddonSchema,
  }),
]);

export type DrawerAddonData = z.infer<typeof drawerAddonSchema>;

// (optionnel) si tu veux un alias pratique
export type DrawerProvider = DrawerAddonData["provider"];
