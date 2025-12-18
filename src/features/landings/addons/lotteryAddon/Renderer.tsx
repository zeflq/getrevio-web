"use client";

import * as React from "react";
import type { LotteryAddonData } from "./schema";
import { useBlockChannel } from "../../preview/BlockChannelContext";
import type { LotteryResultPayload } from "../shared/types";

export function LotteryAddonRenderer({ data }: { data: LotteryAddonData }) {
  const { on, emit } = useBlockChannel();

  const emitResult = React.useCallback(
    (payload: LotteryResultPayload) => {
      emit("lottery:result", payload);
    },
    [emit],
  );

  const playLottery = React.useCallback(async () => {
    if (!data.lotteryId) {
      emitResult({
        status: "ineligible",
        reason: "no_lottery_config",
      });
      return;
    }

    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 600));

      const isWin = Math.random() < 0.5;

      if (isWin) {
        emitResult({
          status: "win",
          win: {
            winId: "fake-win-id",
            giftSnapshot: {
              rewardLabel: "1 margherita offerte",
              minPurchaseAmount: 10,
              minPurchaseCurrency: "EUR",
              validityDays: 7,
            },
            contactMethod: "email",
          },
        });
      } else {
        emitResult({ status: "nowin" });
      }
    } catch (e) {
      console.error("[LotteryAddon] play failed", e);
      emitResult({
        status: "error",
        reason: "exception",
      });
    }
  }, [data.lotteryId, emitResult]);

  React.useEffect(() => {
    const offPlay = on("lottery:play", playLottery);
    return () => offPlay();
  }, [on, playLottery]);

  return null;
}