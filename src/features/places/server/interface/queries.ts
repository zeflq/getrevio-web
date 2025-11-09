import { getServerSession } from "@/lib/auth-server";
import { ActionError } from "@/lib/action-error";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import { createUserContext } from "@/server/core/utils/createUserContext";

import { ListPlacesUseCase } from "../application/usecases/listPlacesUseCase";
import { GetPlaceUseCase } from "../application/usecases/getPlaceUseCase";
import { ListPlacesLiteUseCase } from "../application/usecases/listPlacesLiteUseCase";
import type { PlaceQueryOptions } from "../application/interfaces/placeQueryRepository";
import { PrismaPlaceQueryRepository } from "../infrastructure/prisma/prismaPlaceQueryRepository";
import type { PlaceFilters } from "../../model/placeSchema";
import type { PlaceListDTO } from "../mappers";

const repository = new PrismaPlaceQueryRepository();
const listUseCase = new ListPlacesUseCase(repository);
const getUseCase = new GetPlaceUseCase(repository);
const listLiteUseCase = new ListPlacesLiteUseCase(repository);

type MaybeTenant = string | undefined;
type Options = PlaceQueryOptions | undefined;
type FiltersInput = PlaceFilters | unknown;

export async function listPlacesServer(
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

export async function getPlaceServer(
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

export async function listPlacesLiteServer(
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

export async function getTenantFirstPlaceServer(
  tenantIdOverride?: string | null,
  options?: Options
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const userContext = createUserContext(session);
  if (!tenantIdOverride && !userContext.tenantId) {
    return null;
  }

  const { tenantId } = resolveTenantScope(
    userContext,
    {},
    { tenantIdOverride: tenantIdOverride ?? undefined }
  );

  if (!tenantId) {
    return null;
  }

  const listResult = await listUseCase.execute({
    tenantId,
    filters: {
      q: undefined,
      localName: undefined,
      merchantId: tenantId,
      page: 1,
      pageSize: 1,
      sort: "createdAt",
      order: "asc",
    },
    options,
  });
  const first = listResult.data.at(0);
  if (!first) {
    return null;
  }

  return getUseCase.execute({
    id: first.id,
    tenantId,
    options,
  });
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

export type { PlaceListDTO as PlaceListItem };
