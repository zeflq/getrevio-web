"use server";

import { LandingThemeProvider } from "@/features/landings/theme/themeProvider";
import { TemplateLinearRenderer } from "@/features/landings/preview/TemplateLinearRenderer";
import { ThemeSelector } from "@/features/landings/theme/ThemeSelector";
import { LandingRenderProvider } from "@/features/landings/preview/LandingRenderContext";
import { proxyToAPI } from "@/lib/serverProxy";
import endpoints from "@/shared/api/endpoints.json";
import type { Landing, Theme } from "@/types/domain";

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

  // Fetch landing from API using serverProxy
  const landing = await proxyToAPI<Landing>({
    endpoint: endpoints.landings.byId.replace(':id', id),
  });

  if (!landing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg font-medium text-red-400">Landing not found</p>
        </div>
      </div>
    );
  }

  // Fetch themes if merchantId exists
  // After proxyToAPI unwraps {success, data}, we get just the array
  let themes: Theme[] = [];

  if (landing.merchantId) {
    const query = new URLSearchParams({
      merchantId: landing.merchantId,
      _limit: '50',
    });

    themes = await proxyToAPI<Theme[]>({
      endpoint: `${endpoints.themes.base}?${query.toString()}`,
    });
  }

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
        themes={themes}
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
