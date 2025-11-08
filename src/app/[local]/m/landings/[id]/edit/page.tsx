"use client";

import { use } from "react";                    // add this
import { LandingEditPageContent } from "@/features/landings";
import { useActiveTenantId } from "@/hooks/useActiveTenantId"; // or useMerchantsLite in the admin page

type Props = {
  params: Promise<{ id: string }>;              // make params a Promise
};

export default function MerchantLandingEditPage({ params }: Props) {
  const tenantId = useActiveTenantId();
  const { id } = use(params);                   // unwrap the params Promise

  return (
    <LandingEditPageContent
      id={id}
      merchantId={tenantId}
      merchantsLite={[]}
      shortlinksPath="/m/shortlinks"
    />
  );
}