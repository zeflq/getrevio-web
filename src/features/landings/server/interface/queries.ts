import { getServerSession } from "@/lib/auth-server";
import { ActionError } from "@/lib/action-error";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import type { Role } from "@/server/core/utils/resolveTenantScope";

import { landingFiltersSchema, type LandingFilters } from "../../model/landingSchema";
import type { LandingListDTO } from "../../server/mappers";
import type { LandingQueryOptions } from "../application/interfaces/landingQueryRepository";
import { PrismaLandingQueryRepository } from "../infrastructure/prisma/prismaLandingQueryRepository";
import { ListLandingsUseCase } from "../application/usecases/listLandingsUseCase";
import { GetLandingUseCase } from "../application/usecases/getLandingUseCase";
import { ListLandingsLiteUseCase } from "../application/usecases/listLandingsLiteUseCase";

const repository = new PrismaLandingQueryRepository();
const listUseCase = new ListLandingsUseCase(repository);
const getUseCase = new GetLandingUseCase(repository);
const listLiteUseCase = new ListLandingsLiteUseCase(repository);

type MaybeTenant = string | undefined;
type Options = LandingQueryOptions | undefined;
type FiltersInput = LandingFilters | unknown;

export async function listLandingsServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  const parsedFilters = parseFilters(filters);
  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    typeof filters === "object" && filters !== null ? (filters as Record<string, unknown>) : {},
    { tenantIdOverride: override }
  );

  return listUseCase.execute({ filters: parsedFilters, tenantId, options });
}

export async function getLandingServer(
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

export async function listLandingsLiteServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  const parsedFilters = parseFilters(filters);
  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    typeof filters === "object" && filters !== null ? (filters as Record<string, unknown>) : {},
    { tenantIdOverride: override }
  );

  return listLiteUseCase.execute({ filters: parsedFilters, tenantId, options });
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

function parseFilters(filters: FiltersInput): LandingFilters {
  if (typeof filters === "object" && filters !== null) {
    return landingFiltersSchema.parse(filters);
  }
  return landingFiltersSchema.parse({});
}

function createUserContext(session: any) {
  if (!session?.user?.id) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const role = (session?.user?.globalRole ?? "TENANT_USER") as Role;
  const tenantId =
    session?.session?.activeOrganizationId ?? session?.user?.activeOrganizationId ?? null;

  return {
    id: session?.user?.id as string,
    role,
    tenantId,
  };
}

export type { LandingListDTO as LandingListItem };
