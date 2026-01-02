"use client";

import { useMerchantItem } from "@/features/merchants/hooks/useMerchantCrud";
import { useThemesLite, useThemeItem } from "@/features/themes/hooks/useThemeCrud";
import type { Theme } from "@/types/domain";
import type { LiteListe } from "@/types/lists";

export type MerchantSettingsMerchant = {
  id: string;
  name: string;
  email?: string | null;
};

export type MerchantSettingsData = {
  merchant: MerchantSettingsMerchant | null;
  themes: LiteListe[];
  singleThemeLite: LiteListe | null;
  singleTheme: Theme | null;
};

/**
 * Composes merchant settings data from multiple endpoints:
 * - Merchant info (id, name, email)
 * - List of themes (lite)
 * - If exactly 1 theme: full theme details for editing
 */
export function useMerchantSettings(tenantId: string) {
  // 1. Fetch merchant data
  const {
    data: merchant,
    isLoading: merchantLoading,
    error: merchantError,
  } = useMerchantItem(tenantId);

  // 2. Fetch themes lite (only if merchant loaded)
  const {
    data: themesData,
    isLoading: themesLoading,
    error: themesError,
  } = useThemesLite(
    { merchantId: tenantId, _limit: 50 },
    { enabled: !!merchant }
  );

  const themes = themesData ?? [];
  const singleThemeLite = themes.length === 1 ? themes[0] : null;

  // 3. Fetch full theme (only if exactly 1 theme)
  const {
    data: singleTheme,
    isLoading: themeLoading,
    error: themeError,
  } = useThemeItem(singleThemeLite?.value);

  const isLoading = merchantLoading || themesLoading || (singleThemeLite ? themeLoading : false);
  const error = merchantError || themesError || themeError;

  const data: MerchantSettingsData = {
    merchant: merchant
      ? {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
        }
      : null,
    themes,
    singleThemeLite,
    singleTheme: singleTheme ?? null,
  };

  return {
    data,
    isLoading,
    error,
  };
}
