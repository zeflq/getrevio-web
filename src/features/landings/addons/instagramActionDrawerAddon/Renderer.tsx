"use client";

import type { InstagramActionDrawerAddonData } from "./schema";
import { SocialActionDrawerRenderer } from "../ui/socialActionDrawer/SocialActionDrawerRenderer";

export function InstagramActionDrawerAddonRenderer({
  data,
}: {
  data: InstagramActionDrawerAddonData;
}) {
  return (
    <SocialActionDrawerRenderer
      variant="instagram"
      url={data.instagramUrl}
      i18nNamespace="landings.preview.social.instagram"
    />
  );
}
