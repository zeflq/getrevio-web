"use client";
import type { SimpleHeroData } from "./schema";

export function SimpleHeroRenderer({ data }: { data?: SimpleHeroData | null }) {
  const title = data?.title ?? "Unnamed hero";
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {data?.subtitle && <p className="text-xs text-muted-foreground">{data.subtitle}</p>}
    </div>
  );
}
