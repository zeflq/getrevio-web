"use client";

import type { InstagramActionDrawerAddonData } from "./schema";

export function InstagramActionDrawerAddonRenderer({
  data,
}: {
  data: InstagramActionDrawerAddonData;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
      Hello from Instagram drawer ({data.instagramUrl})
    </div>
  );
}
