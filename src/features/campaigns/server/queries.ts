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

export function listCampaignsServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const { tenantId, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  return listUseCase.execute({ filters, tenantId, options });
}

export function getCampaignServer(
  tenantIdOrId: string,
  maybeId?: string,
  options?: Options
) {
  const hasTenant = typeof maybeId === "string";
  const id = hasTenant ? (maybeId as string) : (tenantIdOrId as string);
  const tenantId = hasTenant ? (tenantIdOrId as string) : undefined;

  return getUseCase.execute({ id, tenantId, options });
}

export function listCampaignsLiteServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
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

export type { CampaignListDTO as CampaignListItem };
