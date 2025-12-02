"use client";

import { SlotBanner } from "../../components/SlotBanner";
import type { SloteBannerData } from "./schema";

type SloteBannerRendererProps = {
  data: SloteBannerData;
};

export function SloteBannerRenderer({ data }: SloteBannerRendererProps) {
  return (
      <SlotBanner name="" />
  );
}
