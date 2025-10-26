export type SetDefaultThemeCommand = {
  merchantId: string;
  themeId: string;
  tenantId?: string | null;
  userRole?: string | null;
};
