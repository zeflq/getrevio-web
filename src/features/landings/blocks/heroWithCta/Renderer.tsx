"use client";
import type { HeroWithCtaData } from "./schema";

export function HeroWithCtaRenderer({ data }: { data: HeroWithCtaData }) {
  const primaryCta = data.ctas[0];
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{data.title || "Untitled hero"}</p>
      {data.subtitle && <p className="text-xs text-muted-foreground">{data.subtitle}</p>}
      <p className="text-xs text-muted-foreground">
        {primaryCta?.label || "Add a CTA"} • {data.ctas.length} CTA
      </p>
    </div>
  );
}
