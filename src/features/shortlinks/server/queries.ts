import { getServerSession } from "@/lib/auth-server";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import { createUserContext } from "@/server/core/utils/createUserContext";

import { ListShortlinksUseCase } from "./application/usecases/listShortlinksUseCase";
import { GetShortlinkUseCase } from "./application/usecases/getShortlinkUseCase";
import type { ShortlinkQueryOptions } from "./application/interfaces/shortlinkQueryRepository";
import { PrismaShortlinkQueryRepository } from "./infrastructure/prisma/prismaShortlinkQueryRepository";
import type { ShortlinkFilters } from "../model/shortlinkSchema";
import type { Shortlink } from "@/types/domain";

const repository = new PrismaShortlinkQueryRepository();
const listUseCase = new ListShortlinksUseCase(repository);
const getUseCase = new GetShortlinkUseCase(repository);

type MaybeTenant = string | undefined;
type Options = ShortlinkQueryOptions | undefined;
type FiltersInput = ShortlinkFilters | unknown;

export async function listShortlinksServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();
  const userContext = createUserContext(session);

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  const filterPayload =
    typeof filters === "object" && filters !== null ? { ...(filters as Record<string, unknown>) } : {};

  const { tenantId } = resolveTenantScope(userContext, filterPayload, { tenantIdOverride: override });
  if (tenantId) {
    filterPayload.merchantId = tenantId;
  }

  return listUseCase.execute({ filters: filterPayload, tenantId, options });
}

export async function getShortlinkServer(
  tenantIdOrId: string,
  maybeId?: string,
  options?: Options
) {
  const session = await getServerSession();
  const userContext = createUserContext(session);

  const hasTenant = typeof maybeId === "string";
  const id = hasTenant ? (maybeId as string) : (tenantIdOrId as string);
  const override = hasTenant ? (tenantIdOrId as string) : undefined;

  const { tenantId } = resolveTenantScope(userContext, {}, { tenantIdOverride: override });

  return getUseCase.execute({ id, tenantId, options });
}

function normalizeFiltersInput(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput
): { tenantId: MaybeTenant; filters: FiltersInput } {
  const hasTenant = typeof tenantIdOrFilters === "string";
  const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
  const filters = hasTenant ? maybeFilters : tenantIdOrFilters;
  return { tenantId, filters: filters ?? {} };
}

export type { Shortlink as ShortlinkListItem };
