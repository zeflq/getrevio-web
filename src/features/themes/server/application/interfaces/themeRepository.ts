import type { ThemeCreateInput, ThemeUpdateInput } from "@/features/themes/model/themeSchema";

export type ThemeCreateRecord = {
  merchantId: string;
  name: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  accentColor?: string | null;
  textColor?: string | null;
  meta?: ThemeCreateInput["meta"];
};

export type ThemeUpdateRecord = {
  id: string;
  merchantId?: string;
  name?: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  accentColor?: string | null;
  textColor?: string | null;
  meta?: ThemeUpdateInput["meta"];
};

export interface ThemeRepository {
  create(data: ThemeCreateRecord): Promise<void>;
  update(data: ThemeUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
  setDefaultTheme(merchantId: string, themeId: string, tenantId?: string | null): Promise<void>;
}
