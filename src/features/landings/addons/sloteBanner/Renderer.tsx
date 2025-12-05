"use client";

import { Button } from "@/components/ui/button";
import { SlotBanner } from "../../components/SlotBanner";
import type { SloteBannerData } from "./schema";

type SloteBannerRendererProps = {
  data: SloteBannerData;
};

export function SloteBannerRenderer({ data }: SloteBannerRendererProps) {

  const handlePlay = () => {
    console.log('play')
  };

  return (
    <div className="flex flex-col items-center">
      <SlotBanner name="" />

      {data.showPlayButton  && (
        <Button
          size="lg"
          className="
          mt-6 px-8 py-2 rounded-xl
          text-[10px] font-extrabold uppercase tracking-[0.25em]
          bg-[var(--landing-secondary)]
          text-[var(--landing-text)]
          shadow-[0_3px_8px_rgba(0,0,0,0.15),0_0_12px_var(--landing-slot-glow-primary)]
          transition-all
          hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,0,0,0.25)]
          active:scale-[0.97]
          disabled:opacity-50 disabled:cursor-not-allowed
          "
          onClick={handlePlay}
        >
        Play
        </Button>
      )}
    </div>
  );
}
