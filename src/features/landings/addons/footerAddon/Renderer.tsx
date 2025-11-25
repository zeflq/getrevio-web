"use client";

import { cn } from "@/lib/utils";

import type { FooterAddonData } from "./schema";

type FooterAddonRendererProps = {
  data: FooterAddonData;
};

export function FooterAddonRenderer({ data }: FooterAddonRendererProps) {
  return (
    <div
      className={cn("mt-6 border-t border-border/60 px-4 py-3 text-sm")}
    >
      {data.text}
    </div>
  );
}
