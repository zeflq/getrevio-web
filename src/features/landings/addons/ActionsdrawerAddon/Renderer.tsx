// actionsdrawerAddon/Renderer.tsx
"use client";

import type { DrawerAddonData } from "./schema";
import { GoogleReviewActionDrawerAddonRenderer } from "../googleReviewActionDrawerAddon/Renderer";
import { InstagramActionDrawerAddonRenderer } from "../instagramActionDrawerAddon/Renderer";

export function ActionsdrawerAddonRenderer({ data }: { data: DrawerAddonData }) {
  switch (data.provider) {
    case "googleReviewActionDrawerAddon":
      return <GoogleReviewActionDrawerAddonRenderer data={data.config} />;

    case "instagramActionDrawerAddon":
      return <InstagramActionDrawerAddonRenderer data={data.config} />;

    default:
      console.error("Unknown actionsdrawerAddon provider:", data);
      return null;
  }
}
