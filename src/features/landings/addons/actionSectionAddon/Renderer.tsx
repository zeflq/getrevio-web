"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import type { ActionSectionAddonData } from "./schema";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useBlockChannel } from "../../preview/BlockChannelContext";

export function ActionSectionAddonRenderer({
  data,
}: {
  data: ActionSectionAddonData;
}) {
    const { emit } = useBlockChannel();
  
  return (
    <section
      className={cn(
        "flex flex-1 flex-col items-center justify-center",
        "min-h-[20vh] pt-4",
        "text-[var(--landing-text)]"
      )}
    >
      {/* Content wrapper */}
      <div className="w-full max-w-3xl text-center space-y-4 md:space-y-5">
        {/* Title */}
        {data.title && (
          <h1
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold",
              "text-[var(--landing-primary)]"
            )}
          >
            {data.title}
          </h1>
        )}

        {/* Subtitle */}
        {data.subtitle && (
          <p
            className={cn(
              "text-lg md:text-xl font-semibold",
              "text-[var(--landing-muted-text)]"
            )}
          >
            {data.subtitle}
          </p>
        )}

        {/* Description */}
        {data.description && (
          <p
            className={cn(
              "text-base md:text-lg mx-auto italic max-w-2xl",
              "text-[var(--landing-secondary)]"
            )}
            style={{
              textShadow: `
                0 0 6px var(--landing-accent),
                0 0 12px var(--landing-accent)
              `,
            }}
          >
            {data.description}
          </p>
        )}

        {/* CTA */}
        {data.buttonLabel && (
          <div className="flex justify-center pt-4 md:pt-6">
            <Button
              onClick={() => {
                emit("cta:primary-click");
              }}
              type="button"
              className={cn(
                "w-full sm:w-auto h-12 px-8 sm:px-10 py-5 text-base sm:text-lg font-semibold rounded-full",
                "flex items-center justify-center gap-2 border-0 shadow-lg",
                "bg-[var(--landing-cta-bg)] text-[var(--landing-cta-text)] hover:bg-[var(--landing-cta-hover-bg)]",
                "transition-transform transition-shadow duration-200",
                "hover:scale-[1.03] hover:shadow-[0_0_25px_var(--landing-cta-bg)]"
              )}
            >
              {data.buttonLabel}
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
