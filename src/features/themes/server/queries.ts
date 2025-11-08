import { getServerSession } from "@/lib/auth-server";
import { ActionError } from "@/lib/action-error";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import { createUserContext } from "@/server/core/utils/createUserContext";

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
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);

  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    typeof filters === "object" && filters !== null ? (filters as Record<string, unknown>) : {},
    { tenantIdOverride: override }
  );

  return listUseCase.execute({ filters, tenantId, options });
}

export async function getThemeServer(
  tenantIdOrId: string,
  maybeId?: string,
  options?: Options
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const hasTenant = typeof maybeId === "string";
  const id = hasTenant ? (maybeId as string) : (tenantIdOrId as string);
  const override = hasTenant ? (tenantIdOrId as string) : undefined;

  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    {},
    { tenantIdOverride: override }
  );

  return getUseCase.execute({ id, tenantId, options });
}

export async function listThemesLiteServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);

  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    typeof filters === "object" && filters !== null ? (filters as Record<string, unknown>) : {},
    { tenantIdOverride: override }
  );

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
