import { getServerSession } from "@/lib/auth-server";
import { ActionError } from "@/lib/action-error";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import type { Role } from "@/server/core/utils/resolveTenantScope";

import { ListCampaignsUseCase } from "./application/usecases/listCampaignsUseCase";
import { GetCampaignUseCase } from "./application/usecases/getCampaignUseCase";
import { ListCampaignsLiteUseCase } from "./application/usecases/listCampaignsLiteUseCase";
import type { CampaignQueryOptions } from "./application/interfaces/campaignQueryRepository";
import { PrismaCampaignQueryRepository } from "./infrastructure/prisma/prismaCampaignQueryRepository";
import type { CampaignFilters } from "../model/campaignSchema";
import type { CampaignListDTO } from "./mappers";

const repository = new PrismaCampaignQueryRepository();
const listUseCase = new ListCampaignsUseCase(repository);
const getUseCase = new GetCampaignUseCase(repository);
const listLiteUseCase = new ListCampaignsLiteUseCase(repository);

type MaybeTenant = string | undefined;

type Options = CampaignQueryOptions | undefined;

type FiltersInput = CampaignFilters | unknown;

export async function listCampaignsServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);

  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    typeof filters === "object" && filters !== null ? (filters as Record<string, unknown>) : {},
    { tenantIdOverride: override }
  );

  return listUseCase.execute({ filters, tenantId, options });
}

export async function getCampaignServer(
  tenantIdOrId: string,
  maybeId?: string,
  options?: Options
) {
  const session = await getServerSession();

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

export async function listCampaignsLiteServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();

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

export type { CampaignListDTO as CampaignListItem };
