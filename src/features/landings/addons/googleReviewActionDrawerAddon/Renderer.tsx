"use client";

import type { GoogleReviewActionDrawerAddonData } from "./schema";

export function GoogleReviewActionDrawerAddonRenderer({
  data,
}: {
  data: GoogleReviewActionDrawerAddonData;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
      Hello from Google Review drawer ({data.googleUrl})
    </div>
  );
}
