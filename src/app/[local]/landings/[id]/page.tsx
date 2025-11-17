"use client";

import * as React from "react";
import { useLandingItem } from "@/features/landings/hooks/useLandingCrud";
import { TemplateLinearRenderer } from "@/features/landings/preview/TemplateLinearRenderer";
import { use } from "react";
import {
  LandingThemeProvider,
} from "@/features/landings/theme/themeProvider";
import { landingThemes } from "@/features/landings/theme/themes";

interface LandingPreviewPageProps {
  params: Promise<{
    local: string;
    id: string;
  }>;
}

export default function LandingPreviewPage({ params }: LandingPreviewPageProps) {
  const { id }= use(params);
  const { data: landing, isLoading } = useLandingItem(id);
  const blocks = landing?.contentDraft?.blocks ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg font-medium text-white/80">Loading landing preview...</p>
        </div>
      </div>
    );
  }

  if (!landing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg font-medium text-red-400">Landing not found</p>
        </div>
      </div>
    );
  }

  return (
    <LandingThemeProvider themes={landingThemes}>
      <div className="min-h-screen flex justify-center">
        <TemplateLinearRenderer blocks={blocks} />
      </div>
    </LandingThemeProvider>
  );
}
