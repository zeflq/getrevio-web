"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { SlotBanner, SlotBannerHandle } from "../../components/SlotBanner";
import type { SloteBannerData } from "./schema";

type SloteBannerRendererProps = {
  data: SloteBannerData;
};

export function SloteBannerRenderer({ data }: SloteBannerRendererProps) {

  const slotRef = useRef<SlotBannerHandle | null>(null);

  const handlePlay = () => {
    slotRef.current?.startSpin();
    const handle = setTimeout(() => {
      slotRef.current?.stopWithWin();
    }, 4000);
    return () => clearTimeout(handle);
  };

  return (
    <div className="flex flex-col items-center">
      <SlotBanner ref={slotRef} name={"NameX"} />

      {data.showPlayButton  && (
        <Button
          size="lg"
          className="
          mt-6 px-8 py-2 rounded-xl
          text-[10px] font-extrabold uppercase tracking-[0.25em]
          bg-(--landing-secondary)
          text-(--landing-text)
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
      {/* <Button onClick={()=>{
        slotRef.current?.startSpin();
      }}>
        plat
      </Button>
      <Button onClick={()=>{
        slotRef.current?.stopWithWin();
      }}>
        win
      </Button>
      <Button onClick={()=>{
        slotRef.current?.stopWithLose();
      }}>
        lost
      </Button> */}
    </div>
  );
}
