"use client";

import * as React from "react";
import { SlotBanner } from "../slotGame/SlotBanner";


export function SlotHeroRenderer() {
  return (
    <section
      className="
        flex flex-col items-center
        text-[var(--landing-text)]
      "
    >
      <SlotBanner name="Slot hero" />
    </section>
  );
}
