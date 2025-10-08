import { createCrudHooks } from '@/hooks/createCrudHooks';
import { Theme } from '@/types/domain';
import { listThemes } from '../api/listThemes';
import { getThemeById } from '../api/getThemeById';
import { createTheme } from '../api/createTheme';
import { updateTheme } from '../api/updateTheme';
import { deleteTheme } from '../api/deleteTheme';
import type { ThemeCreateInput, ThemeLite, ThemeQueryParams, ThemeUpdateInput } from '../model/themeSchema';

const crud = createCrudHooks<Theme, string, ThemeLite>({
  keyBase: ['themes'],
  list: (params) => listThemes(params as ThemeQueryParams),
  get: (id) => getThemeById(id),
  create: (input) => createTheme(input as ThemeCreateInput),
  update: (id, input) => updateTheme(id, input as ThemeUpdateInput),
  remove: (id) => deleteTheme(id),
  lite: {
    map: (p) => ({ id: p.id, name: p.name }),
    paramKey: "_lite",
    defaultLimit: 20,
  },
  staleTimeMs: 60_000,
});

export const useThemesList = (params: ThemeQueryParams = {}) => crud.useList!(params);
export const useThemesLite = (
  params: Omit<ThemeQueryParams, "_lite"> = {},
  opts?: { enabled?: boolean }
) => crud.useLite!(params, opts);
export const useThemeItem = (id?: string) => crud.useItem!(id);
export const useCreateTheme = () => crud.useCreate!();
export const useUpdateTheme = () => crud.useUpdate!();
export const useDeleteTheme = () => crud.useRemove!();