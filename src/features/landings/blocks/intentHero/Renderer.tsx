"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useStepController } from "@/features/landings/preview/useStepController";
import { useBlockChannel } from "@/features/landings/preview/BlockChannelContext";

import type { IntentHeroData } from "./schema";
import { ArrowRight } from "lucide-react";
import { SlotBanner } from "../slotGame/SlotBanner";
import { cn } from "@/lib/utils";

export function IntentHeroRenderer({ data }: { data: IntentHeroData }) {
  const { next } = useStepController();
  const { emit } = useBlockChannel();

  return (
    <section
      className="
        flex flex-1 flex-col items-center
        min-h-[80vh]
        pt-10 pb-16 px-4
        text-[var(--landing-text)]
      "
    >
      <div className="flex flex-col items-center flex-grow justify-start md:justify-center space-y-10">
        {/* Slot Banner */}
        <SlotBanner name={data.title} />

        {/* Content */}
        <div
          className="text-center"
        >
          {/* Title */}
          <h1
            className="
              text-2xl md:text-3xl font-bold mb-4
              text-[var(--landing-primary)]
            "
          >
            {data.title}
          </h1>

          {/* Subtitle */}
          {data.subtitle && (
            <p
              className="
                text-xl md:text-2xl font-semibold mb-6
                text-[var(--landing-muted-text)]
              "
            >
              {data.subtitle}
            </p>
          )}

          {/* Description */}
          {data.description && (
            <p
              className="
                text-lg md:text-xl mx-auto mb-8 italic
                text-[var(--landing-secondary)]
              "
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
          {data.cta?.label && (
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                onClick={() => {
                  emit("cta:primary-click", { source: "intentHero" });
                  next();
                }}
                className={cn(
                  "w-full h-12 px-6 mt-4 sm:mt-8 py-5 sm:py-5 text-base sm:text-lg font-semibold rounded-full",
                  "flex items-center justify-center gap-2 shadow-lg border-0",
                  "bg-[var(--landing-cta-bg)] text-[var(--landing-cta-text)] hover:bg-[var(--landing-cta-hover-bg)]"
                )}
              >
                {data.cta.label}
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
