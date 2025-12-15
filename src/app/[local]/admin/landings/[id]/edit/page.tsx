"use client";

import { use } from "react";
import { LandingEditPageView } from "@/features/landings/components/LandingEditPageView";

type PageParams = {
  params: Promise<{ id: string }>;
};

export default function AdminLandingEditPage({ params }: PageParams) {
  const { id } = use(params);

  return <LandingEditPageView id={id} tenantId={null} />;
}
