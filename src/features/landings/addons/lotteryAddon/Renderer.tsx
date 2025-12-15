"use client";

import * as React from "react";
import type { LotteryAddonData } from "./schema";
import { useLandingRenderContext } from "../../preview/LandingRenderContext";
import { useBlockChannel } from "../../preview/BlockChannelContext";

type LotteryAddonRendererProps = {
  data: LotteryAddonData;
};

export function LotteryAddonRenderer({ data }: LotteryAddonRendererProps) {
  const { landingId } = useLandingRenderContext();
  const { on, emit } = useBlockChannel();
  const fakeCall = async () =>{ try {
      // TODO: remplacer par ton vrai call API
      // const res = await fetch("/api/public/lotteries/play", {...})

      await new Promise((r) => setTimeout(r, 600)); // fake delay
      const isWin = Math.random() < 0.5;

      if (isWin) {
        emit("lottery:win", {
          winId: "fake-win-id",
          giftSnapshot: {
            rewardLabel: "1 margherita offerte",
            minPurchaseAmount: 10,
            minPurchaseCurrency: "EUR",
            validityDays: 7,
          },
        });
      } else {
        emit("lottery:nowin");
      }
    } catch (e) {
      console.error("[LotteryAddon] error during play", e);
      emit("lottery:error", { reason: "exception" });
    }
  }

  React.useEffect(() => {
    const offPlay = on("lottery:play", async () => {
      if (!data.lotteryId) {
        console.warn("[LotteryAddon] missing lotteryId");
        emit("lottery:ineligible", { reason: "no_lottery_config" });
        return;
      }

      fakeCall();
    });

    return () => {
      offPlay();
    };
  }, [on, emit, data.lotteryId, landingId]);

  return null;
}
