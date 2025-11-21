"use server";

import { LandingThemeProvider } from "@/features/landings/theme/themeProvider";
import { TemplateLinearRenderer } from "@/features/landings/preview/TemplateLinearRenderer";
import { getLandingServer } from "@/features/landings/server/interface/queries";
import { listThemesServer } from "@/features/themes/server/queries";
import { ThemeSelector } from "@/features/landings/theme/ThemeSelector";

interface LandingPreviewPageProps {
  params: {
    local: string;
    id: string;
  };
  searchParams: {
    preview?: string; // "draft" | "live"
  };
}

export default async function LandingPreviewPage({
  params,
  searchParams,
}: LandingPreviewPageProps) {
  const { id } = await params;
  const landing = await getLandingServer(id);

  if (!landing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg font-medium text-red-400">Landing not found</p>
        </div>
      </div>
    );
  }

  const themesPayload = landing.merchantId
    ? await listThemesServer({ merchantId: landing.merchantId, _limit: 50 })
    : { data: [] };

  // décider du mode preview
  const previewMode = (await searchParams).preview === "live" ? "live" : "draft";

  const content =
    previewMode === "live" ? landing.contentPublished : landing.contentDraft;

  const blocks = content?.blocks ?? [];

  return (
    <LandingThemeProvider
      themes={themesPayload.data}
      themeId={landing.themeId ?? undefined}
    >
      <div className="min-h-screen flex flex-col justify-center max-w-xl">
        <div className="flex justify-end">
          <ThemeSelector/>
        </div>
        <TemplateLinearRenderer blocks={blocks} />
      </div>
    </LandingThemeProvider>
  );
}
