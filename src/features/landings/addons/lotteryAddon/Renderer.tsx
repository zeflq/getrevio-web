"use client";

import * as React from "react";
import type { LotteryAddonData } from "./schema";

export function LotteryAddonRenderer({ data }: { data: LotteryAddonData }) {
  // If no lottery is selected, don't render anything
  if (!data.lotteryId) {
    return null;
  }

  // This is a placeholder renderer
  // You can customize this to show a lottery participation form or button
  return (
    <div className="lottery-addon">
      {/* Lottery content will be rendered here based on the selected lottery */}
      {/* Contact method: {data.contactMethod} */}
    </div>
  );
}
