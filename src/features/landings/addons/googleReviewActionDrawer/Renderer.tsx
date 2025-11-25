"use client";

import type { GoogleReviewActionDrawerData } from "./schema";

export function GoogleReviewActionDrawerRenderer({
  data,
}: {
  data: GoogleReviewActionDrawerData;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
      Hello from Google Review drawer ({data.googleUrl})
    </div>
  );
}
