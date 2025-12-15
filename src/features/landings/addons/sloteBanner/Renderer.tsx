"use client";

import { useEffect, useRef, useState } from "react";

import { SlotBanner, SlotBannerHandle } from "../../components/SlotBanner";
import type { SloteBannerData } from "./schema";
import { useLandingRenderContext } from "../../preview/LandingRenderContext";
import { useBlockChannel } from "../../preview/BlockChannelContext";
import { Loader2 } from "lucide-react";

type SloteBannerRendererProps = {
  data: SloteBannerData;
};

export function SloteBannerRenderer({ data }: SloteBannerRendererProps) {
  const landingInfo = useLandingRenderContext();
  const { emit, on } = useBlockChannel();
  const slotRef = useRef<SlotBannerHandle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const name = landingInfo?.belongsTo?.label || "";

  const handlePlay = () => {
    if (isPlaying) return; // sécurité en plus
    setIsPlaying(true);
    emit("lottery:play");
  };

  useEffect(() => {
    const makeSpin = (mode: "win" | "lose") => {
      if (!slotRef.current) return;
      slotRef.current.startSpin();
      setTimeout(() => {
        if (mode === "win") {
          slotRef.current?.stopWithWin();
        } else {
          slotRef.current?.stopWithLose();
        }
      }, 1200);
    };

    const offWin = on("lottery:win", () => {
      makeSpin("win");
    });

    const offLose = on("lottery:nowin", () => {
      makeSpin("lose");
    });

    const offError = on("lottery:error", () => {
      makeSpin("lose");
    });

    const offIneligible = on("lottery:ineligible", (payload) => {
      setIsPlaying(false);
      console.log("User ineligible for lottery", payload);
      // Ici : tu ouvreras plus tard un drawer d’info
    });

    return () => {
      offWin();
      offLose();
      offError();
      offIneligible();
    };
  }, [on]);

  return (
    <div className="flex flex-col items-center">
      <SlotBanner 
        ref={slotRef} 
        name={name}
        onSpinEnd={() => {
          // ✅ FIN RÉELLE DE L'ANIM (après stopReelsSequential)
          setIsPlaying(false);
        }}
      />

      {data.showPlayButton && (
        <button
          type="button"
          disabled={isPlaying}
          className="
            mt-6 px-8 py-3 rounded-xl
            text-[10px] font-extrabold uppercase tracking-[0.25em]
            bg-(--landing-secondary)
            text-(--landing-text)
            shadow-[0_3px_8px_rgba(0,0,0,0.15),0_0_12px_var(--landing-slot-glow-primary)]
            transition-all
            hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,0,0,0.25)]
            hover:bg-(--landing-slot-center-bg) hover:text-(--landing-slot-center-text)
            active:scale-[0.97]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          onClick={handlePlay}
        >
          {
            isPlaying ? 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : "Play"
          }
        </button>
      )}
    </div>
  );
}
