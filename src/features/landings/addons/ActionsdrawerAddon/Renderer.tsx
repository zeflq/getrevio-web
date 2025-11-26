"use client";

import type { DrawerAddonData } from "./schema";
import { GoogleReviewActionDrawerAddonRenderer } from "../googleReviewActionDrawerAddon/Renderer";
import { InstagramActionDrawerAddonRenderer } from "../instagramActionDrawerAddon/Renderer";

export function ActionsdrawerAddonRenderer({
  data,
}: {
  data: DrawerAddonData;
}) {
  switch (data.drawer.kind) {
    case "googleReviewActionDrawerAddon":
      return <GoogleReviewActionDrawerAddonRenderer data={data.drawer} />;
    case "instagramActionDrawerAddon":
      return <InstagramActionDrawerAddonRenderer data={data.drawer} />;
    default:
      return null;
  }
}
