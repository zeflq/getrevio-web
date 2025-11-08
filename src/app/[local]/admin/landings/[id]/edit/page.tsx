"use client";

import { LandingEditPageContent } from "@/features/landings";
import { useMerchantsLite } from "@/features/merchants";
import { use } from "react";

type Props = {
  params: Promise<{ id: string }>;              // make params a Promise
};

export default function LandingEditPage({ params }: Props) {
  const merchantsLiteQuery = useMerchantsLite();
  const { id } = use(params);       

  return (
    <LandingEditPageContent
      id={id}
      merchantsLite={merchantsLiteQuery.data ?? []}
      shortlinksPath="/admin/shortlinks"
    />
  );
}
