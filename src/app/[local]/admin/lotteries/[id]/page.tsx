"use client";

import { use } from "react";

import { useMerchantsLite } from "@/features/merchants";
import { LotteriesEditPageView } from "@/features/lotteries/components/LotteriesEditPageView";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function AdminLotteryEditPage({ params }: PageParams) {
  const { id } = use(params);
  const merchantsLiteQuery = useMerchantsLite();

  return (
    <LotteriesEditPageView id={id} merchantsLite={merchantsLiteQuery.data ?? []} />
  );
}
