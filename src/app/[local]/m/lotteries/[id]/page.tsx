"use client";

import { use } from "react";

import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { LotteriesEditPageView } from "@/features/lotteries/components/LotteriesEditPageView";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function MerchantLotteryEditPage({ params }: PageParams) {
  const { id } = use(params);
  const tenantId = useActiveTenantId();

  return (
    <LotteriesEditPageView
      id={id}
      merchantId={tenantId ?? undefined}
    />
  );
}
