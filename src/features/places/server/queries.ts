import { ensureSuperAdmin } from "@/server/core/security/adminGuards";

import { ListPlacesUseCase } from "./application/usecases/listPlacesUseCase";
import { GetPlaceUseCase } from "./application/usecases/getPlaceUseCase";
import { ListPlacesLiteUseCase } from "./application/usecases/listPlacesLiteUseCase";
import type { PlaceQueryOptions } from "./application/interfaces/placeQueryRepository";
import { PrismaPlaceQueryRepository } from "./infrastructure/prisma/prismaPlaceQueryRepository";
import type { PlaceFilters } from "../model/placeSchema";
import type { PlaceListDTO } from "./mappers";

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
  await ensureSuperAdmin();

  const { tenantId, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  return listUseCase.execute({ filters, tenantId, options });
}

export async function getPlaceServer(
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

export async function listPlacesLiteServer(
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

export type { PlaceListDTO as PlaceListItem };
