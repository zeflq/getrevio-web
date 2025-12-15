"use client";

import { use } from "react";
import { useActiveTenantId } from "@/hooks/useActiveTenantId";
import { LandingEditPageView } from "@/features/landings/components/LandingEditPageView";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function MerchantLandingEditPage({ params }: PageParams) {
  const { id } = use(params);
  const tenantId = useActiveTenantId();

  return <LandingEditPageView id={id} tenantId={tenantId} />;
}
