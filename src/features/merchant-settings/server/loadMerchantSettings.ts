import { getMerchantServer } from "@/features/merchants/server/queries";
import { PrismaThemeQueryRepository } from "@/features/themes/server/infrastructure/prisma/prismaThemeQueryRepository";
import { ListThemesLiteUseCase } from "@/features/themes/server/application/usecases/listThemesLiteUseCase";
import { GetThemeUseCase } from "@/features/themes/server/application/usecases/getThemeUseCase";
import type { ThemeListItem } from "@/features/themes/server/queries";

const themeQueryRepository = new PrismaThemeQueryRepository();
const listThemesLiteUseCase = new ListThemesLiteUseCase(themeQueryRepository);
const getThemeUseCase = new GetThemeUseCase(themeQueryRepository);

export type MerchantSettingsMerchant = {
  id: string;
  name: string;
  email?: string | null;
  defaultThemeId?: string | null;
};

export type MerchantSettingsData = {
  merchant: MerchantSettingsMerchant | null;
  themes: { value: string; label: string }[];
  singleThemeLite: { value: string; label: string } | null;
  singleTheme: ThemeListItem | null;
};

export async function loadMerchantSettings(args: { tenantId?: string | null }): Promise<MerchantSettingsData> {
  const tenantId = args.tenantId ?? null;

  if (!tenantId) {
    return {
      merchant: null,
      themes: [],
      singleThemeLite: null,
      singleTheme: null,
    };
  }

  let merchant: MerchantSettingsMerchant | null = null;

  try {
    const record = await getMerchantServer({
      id: tenantId,
      tenantId,
    });

    if (record) {
      merchant = {
        id: record.id,
        name: record.name ?? "",
        email: record.email ?? null,
        defaultThemeId: record.defaultThemeId ?? null,
      };
    }
  } catch (error) {
    console.error("Failed to load merchant for settings", error);
  }

  if (!merchant) {
    return {
      merchant: null,
      themes: [],
      singleThemeLite: null,
      singleTheme: null,
    };
  }

  const themes = await listThemesLiteUseCase
    .execute({
      filters: { _limit: 50 },
      tenantId: merchant.id,
    })
    .catch((error) => {
      console.error("Failed to load themes for merchant settings", error);
      return [] as { value: string; label: string }[];
    });

  const singleThemeLite = themes.length === 1 ? themes[0] : null;

  const singleTheme = singleThemeLite
    ? await getThemeUseCase
        .execute({
          id: singleThemeLite.value,
          tenantId: merchant.id,
        })
        .catch((error) => {
          console.error("Failed to load single theme for editing", error);
          return null;
        })
    : null;

  return {
    merchant,
    themes,
    singleThemeLite,
    singleTheme,
  };
}
