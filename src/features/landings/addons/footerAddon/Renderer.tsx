"use client";

import { cn } from "@/lib/utils";

import type { FooterAddonData } from "./schema";

type FooterAddonRendererProps = {
  data: FooterAddonData;
};

export function FooterAddonRenderer({ data }: FooterAddonRendererProps) {
  const alignmentClass =
    data.align === "left"
      ? "text-left"
      : data.align === "right"
      ? "text-right"
      : "text-center";

  const toneColor = data.tone === "muted" ? "var(--landing-muted-text)" : "var(--landing-text)";

  return (
    <div
      className={cn("mt-6 border-t border-border/60 px-4 py-3 text-sm", alignmentClass)}
      style={{ color: toneColor }}
    >
      {data.text}
    </div>
  );
}
