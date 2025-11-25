import { z } from "zod";

import { actionDrawerBaseSchema } from "../schemas/actionDrawerBase";
import { googleReviewActionDrawerSchema } from "../googleReviewActionDrawer/schema";
import { instagramActionDrawerSchema } from "../instagramActionDrawer/schema";

export const drawerAddonSchema = actionDrawerBaseSchema.extend({
  kind: z.literal("drawer"),
  drawer: z.discriminatedUnion("kind", [
    googleReviewActionDrawerSchema,
    instagramActionDrawerSchema,
  ]),
});

export type DrawerAddonData = z.infer<typeof drawerAddonSchema>;
