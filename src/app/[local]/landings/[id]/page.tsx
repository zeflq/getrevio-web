"use server";

import { LandingThemeProvider } from "@/features/landings/theme/themeProvider";
import { TemplateLinearRenderer } from "@/features/landings/preview/TemplateLinearRenderer";
import { getLandingServer } from "@/features/landings/server/interface/queries";
import { listThemesServer } from "@/features/themes/server/queries";
import { ThemeSelector } from "@/features/landings/theme/ThemeSelector";
import { LandingRenderProvider } from "@/features/landings/preview/LandingRenderContext";

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
    <LandingRenderProvider
        value={{
          landingId: landing.id,
          merchantId: landing.merchantId,
          belongsTo: landing.belongsTo ?? null,
          previewMode,
        }}
      >
      <LandingThemeProvider
        themes={themesPayload.data}
        themeId={landing.themeId ?? undefined}
      >
        <main className="min-h-screen flex flex-col justify-start max-w-md w-full px-6 space-y-6">
          <header className="flex justify-end pt-4">
            <ThemeSelector/>
          </header>
          <TemplateLinearRenderer blocks={blocks} />
        </main>
      </LandingThemeProvider>
    </LandingRenderProvider>
  );
}
