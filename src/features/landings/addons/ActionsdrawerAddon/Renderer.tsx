"use client";

import type { DrawerAddonData } from "./schema";
import { GoogleReviewActionDrawerRenderer } from "../googleReviewActionDrawer/Renderer";
import { InstagramActionDrawerRenderer } from "../instagramActionDrawer/Renderer";

export function ActionsdrawerAddonRenderer({
  data,
}: {
  data: DrawerAddonData;
}) {
  switch (data.drawer.kind) {
    case "google-review":
      return <GoogleReviewActionDrawerRenderer data={data.drawer} />;
    case "instagram":
      return <InstagramActionDrawerRenderer data={data.drawer} />;
    default:
      return null;
  }
}
