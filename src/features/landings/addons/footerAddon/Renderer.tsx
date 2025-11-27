"use client";

import { cn } from "@/lib/utils";

import type { FooterAddonData } from "./schema";

type FooterAddonRendererProps = {
  data: FooterAddonData;
};

export function FooterAddonRenderer({ data }: FooterAddonRendererProps) {
  return (
    <div
      className={cn("w-full mt-6 border-t border-border/10 px-4 py-3 text-[var(--landing-muted-text)] text-sm text-center")}
    >
      {data.text}
    </div>
  );
}
