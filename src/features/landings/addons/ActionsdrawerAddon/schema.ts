import { z } from "zod";

import { googleReviewActionDrawerAddonSchema } from "../googleReviewActionDrawerAddon/schema";
import { instagramActionDrawerAddonSchema } from "../instagramActionDrawerAddon/schema";

export const drawerAddonSchema = z.object({
  kind: z.literal("drawer"),
  drawer: z.discriminatedUnion("kind", [
    googleReviewActionDrawerAddonSchema,
    instagramActionDrawerAddonSchema,
  ]),
});

export type DrawerAddonData = z.infer<typeof drawerAddonSchema>;
