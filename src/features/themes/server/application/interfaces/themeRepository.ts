import type { ThemeCreateInput, ThemeUpdateInput } from "@/features/themes/model/themeSchema";

export type ThemeCreateRecord = {
  merchantId: string;
  name: string;
  meta?: ThemeCreateInput["meta"];
};

export type ThemeUpdateRecord = {
  id: string;
  merchantId?: string;
  name?: string;
  meta?: ThemeUpdateInput["meta"];
};

export interface ThemeRepository {
  create(data: ThemeCreateRecord): Promise<string>;
  update(data: ThemeUpdateRecord, tenantId?: string | null): Promise<void>;
  delete(id: string, tenantId?: string | null): Promise<void>;
  setDefaultTheme(merchantId: string, themeId: string, tenantId?: string | null): Promise<void>;
}
