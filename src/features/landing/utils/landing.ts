import type { LandingDefaults } from "../model/landingSchema";

export function resolveLandingCopy(
  placeDefaults: LandingDefaults | undefined,
  campaignOverride: LandingDefaults | undefined
): LandingDefaults {
  return {
    title: campaignOverride?.title ?? placeDefaults?.title,
    subtitle: campaignOverride?.subtitle ?? placeDefaults?.subtitle,
    primaryCtaLabel: campaignOverride?.primaryCtaLabel ?? placeDefaults?.primaryCtaLabel,
    primaryCtaUrl: campaignOverride?.primaryCtaUrl ?? placeDefaults?.primaryCtaUrl,
    secondaryCtaLabel: campaignOverride?.secondaryCtaLabel ?? placeDefaults?.secondaryCtaLabel,
    secondaryCtaUrl: campaignOverride?.secondaryCtaUrl ?? placeDefaults?.secondaryCtaUrl,
  };
}