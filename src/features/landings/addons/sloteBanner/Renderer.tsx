"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { SlotBanner, SlotBannerHandle } from "./SlotBanner";
import type { SloteBannerData } from "./schema";
import { useLandingRenderContext } from "../../preview/LandingRenderContext";
import { useBlockChannel } from "../../preview/BlockChannelContext";
import type { LotteryResultPayload } from "../shared/types";

type SloteBannerRendererProps = {
  data: SloteBannerData;
};


export function SloteBannerRenderer({ data }: SloteBannerRendererProps) {
  const landingInfo = useLandingRenderContext();
  const { emit, on } = useBlockChannel();

  const slotRef = useRef<SlotBannerHandle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // stores the win payload until the spin ends, then we reveal the drawer
  const pendingWinRef = useRef<Extract<LotteryResultPayload, { status: "win" }> | null>(null);

  const name = landingInfo?.belongsTo?.label || "";

  const handlePlay = () => {
    if (isPlaying || hasPlayedOnce) return;
    setIsPlaying(true);
    emit("lottery:play");
  };

  useEffect(() => {
    const makeSpin = (mode: "win" | "lose") => {
      if (!slotRef.current) {
        // fail-safe: if we can't animate, don't lock the UI
        setIsPlaying(false);
        // also clear any pending win to avoid surprise drawer later
        pendingWinRef.current = null;
        return;
      }

      slotRef.current.startSpin();

      setTimeout(() => {
        if (mode === "win") slotRef.current?.stopWithWin();
        else slotRef.current?.stopWithLose();
      }, 1200);
    };

    // ✅ NEW: listen to the *result*, not "lottery:win" directly
    const offResult = on("lottery:result", (payload: LotteryResultPayload) => {
      if (payload?.status === "win") {
        pendingWinRef.current = payload;
        makeSpin("win");
        return;
      }

      if (payload?.status === "nowin") {
        makeSpin("lose");
        return;
      }

      // error -> lose animation (and you can show a toast later)
      if (payload?.status === "error") {
        makeSpin("lose");
        return;
      }

      // unknown payload -> unlock
      setIsPlaying(false);
      pendingWinRef.current = null;
    });

    const offIneligible = on("lottery:ineligible", (payload) => {
      setIsPlaying(false);
      pendingWinRef.current = null;
      console.log("User ineligible for lottery", payload);
      // later: emit("ui:openIneligibleDrawer", payload)
    });

    return () => {
      offResult();
      offIneligible();
    };
  }, [on]);

  const handleSpinEnd = () => {
    // ✅ FIN RÉELLE DE L'ANIM (après stopReelsSequential)
    setIsPlaying(false);
    setHasPlayedOnce(true);

    // ✅ Reveal win ONLY after the spin ends
    const pending = pendingWinRef.current;

    if (pending && pending.win) {
      emit("lottery:revealWin", {
        winId: pending.win.winId,
        giftSnapshot: pending.win.giftSnapshot,
        contactMethod: pending.win.contactMethod,
      });
      pendingWinRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <SlotBanner ref={slotRef} name={name} onSpinEnd={handleSpinEnd} />

      {data.showPlayButton && !hasPlayedOnce && (
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
