"use client";

import { cn } from "@/lib/utils";
import type { SimpleTitleAddonData } from "./schema";

type SimpleTitleAddonRendererProps = {
  data: SimpleTitleAddonData;
};

export function SimpleTitleAddonRenderer({ data }: SimpleTitleAddonRendererProps) {
  if (!data.title) return null;

  return (
    <section className="w-full px-4 pt-12 pb-6 text-center">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Title */}
        <h2
          className={cn(
            "font-bold leading-tight",
            "text-[var(--landing-primary)]",
            "text-2xl md:text-3xl lg:text-4xl",
          )}
        >
          {data.title}
        </h2>

        {/* Subtitle */}
        {data.subtitle && (
          <p
            className={cn(
              "text-base md:text-lg font-medium",
              "text-[var(--landing-muted-text)]",
              "max-w-2xl mx-auto",
              "mt-2"
            )}
          >
            {data.subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
