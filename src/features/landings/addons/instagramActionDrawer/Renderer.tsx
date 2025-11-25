"use client";

import type { InstagramActionDrawerData } from "./schema";

export function InstagramActionDrawerRenderer({
  data,
}: {
  data: InstagramActionDrawerData;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
      Hello from Instagram drawer ({data.instagramUrl})
    </div>
  );
}
