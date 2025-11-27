"use client";

import type { GoogleReviewActionDrawerAddonData } from "./schema";
import { SocialActionDrawerRenderer } from "../ui/socialActionDrawer/SocialActionDrawerRenderer";

export function GoogleReviewActionDrawerAddonRenderer({
  data,
}: {
  data: GoogleReviewActionDrawerAddonData;
}) {
  return (
    <SocialActionDrawerRenderer
      variant="google"
      url={data.googleUrl}
      i18nNamespace="landings.preview.social.google"
    />
  );
}
