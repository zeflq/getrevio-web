import type { ThemeCreateInput } from "@/features/themes/model/themeSchema";

export type CreateThemeCommand = ThemeCreateInput & {
  tenantId?: string | null;
  userRole?: string | null;
};
