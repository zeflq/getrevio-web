import { ensureSuperAdmin } from "@/server/core/security/adminGuards";

import { ListThemesUseCase } from "./application/usecases/listThemesUseCase";
import { GetThemeUseCase } from "./application/usecases/getThemeUseCase";
import { ListThemesLiteUseCase } from "./application/usecases/listThemesLiteUseCase";
import type { ThemeQueryOptions } from "./application/interfaces/themeQueryRepository";
import { PrismaThemeQueryRepository } from "./infrastructure/prisma/prismaThemeQueryRepository";
import type { ThemeFilters } from "../model/themeSchema";
import type { ThemeListDTO } from "./mappers";

const repository = new PrismaThemeQueryRepository();
const listUseCase = new ListThemesUseCase(repository);
const getUseCase = new GetThemeUseCase(repository);
const listLiteUseCase = new ListThemesLiteUseCase(repository);

type MaybeTenant = string | undefined;
type Options = ThemeQueryOptions | undefined;
type FiltersInput = ThemeFilters | unknown;

export async function listThemesServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  await ensureSuperAdmin();

  const { tenantId, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  return listUseCase.execute({ filters, tenantId, options });
}

export async function getThemeServer(
  tenantIdOrId: string,
  maybeId?: string,
  options?: Options
) {
  await ensureSuperAdmin();

  const hasTenant = typeof maybeId === "string";
  const id = hasTenant ? (maybeId as string) : (tenantIdOrId as string);
  const tenantId = hasTenant ? (tenantIdOrId as string) : undefined;

  return getUseCase.execute({ id, tenantId, options });
}

export async function listThemesLiteServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  await ensureSuperAdmin();

  const { tenantId, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  return listLiteUseCase.execute({ filters, tenantId, options });
}

function normalizeFiltersInput(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput
): { tenantId: MaybeTenant; filters: FiltersInput } {
  const hasTenant = typeof tenantIdOrFilters === "string";
  const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
  const filters = hasTenant ? maybeFilters : tenantIdOrFilters;
  return { tenantId, filters };
}

export type { ThemeListDTO as ThemeListItem };
