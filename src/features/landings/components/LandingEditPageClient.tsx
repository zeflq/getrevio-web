"use client";

import { useMerchantsLite } from "@/features/merchants";
import { LandingEditPageContent } from "./LandingEditPageContent";

interface LandingEditPageClientProps {
  id: string;
  merchantId?: string;
  shortlinksPath?: string;
}

export function LandingEditPageClient({ id, merchantId, shortlinksPath }: LandingEditPageClientProps) {
  const merchantsLiteQuery = useMerchantsLite();

  return (
    <LandingEditPageContent
      id={id}
      merchantId={merchantId}
      merchantsLite={merchantsLiteQuery.data ?? []}
      shortlinksPath={shortlinksPath}
    />
  );
}
