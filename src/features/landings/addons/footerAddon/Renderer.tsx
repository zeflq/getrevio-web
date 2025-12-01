"use client";

import { cn } from "@/lib/utils";
import type { FooterAddonData } from "./schema";

type FooterAddonRendererProps = {
  data: FooterAddonData;
};

export function FooterAddonRenderer({ data }: FooterAddonRendererProps) {
  return (
    <footer
      className={cn(
        "w-full mt-10",
        "border-t border-border/10",
        "px-4 py-6",
        "text-center text-sm",
        "text-[var(--landing-muted-text)]/80",
        "backdrop-blur-[1px]"
      )}
    >
      <p className="max-w-3xl mx-auto leading-relaxed transition-opacity duration-200 hover:opacity-90">
        {data.text}
      </p>
    </footer>
  );
}
