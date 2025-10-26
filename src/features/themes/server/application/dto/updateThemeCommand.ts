import type { ThemeUpdateInput } from "@/features/themes/model/themeSchema";

export type UpdateThemeCommand = ThemeUpdateInput & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};
