import { ensureSuperAdmin } from "@/server/core/security/adminGuards";

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
  await ensureSuperAdmin();

  const { tenantId, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  return listUseCase.execute({ filters, tenantId, options });
}

export async function getShortlinkServer(
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

function normalizeFiltersInput(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput
): { tenantId: MaybeTenant; filters: FiltersInput } {
  const hasTenant = typeof tenantIdOrFilters === "string";
  const tenantId = hasTenant ? (tenantIdOrFilters as string) : undefined;
  const filters = hasTenant ? maybeFilters : tenantIdOrFilters;
  return { tenantId, filters };
}

export type { Shortlink as ShortlinkListItem };
