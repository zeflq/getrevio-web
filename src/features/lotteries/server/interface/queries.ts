import { getServerSession } from "@/lib/auth-server";
import { ActionError } from "@/lib/action-error";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import { createUserContext } from "@/server/core/utils/createUserContext";

import type { LotteryFilters } from "@/features/lotteries/model/lotterySchema";
import type {
  LotteryConfigDetailDTO,
  LotteryConfigListDTO,
} from "@/features/lotteries/server/mappers";
import type {
  LotteryConfigQueryRepository,
  LotteryQueryOptions,
} from "@/features/lotteries/server/application/interfaces/lotteryConfigQueryRepository";
import { PrismaLotteryConfigQueryRepository } from "@/features/lotteries/server/infrastructure/prisma/prismaLotteryConfigQueryRepository";
import { ListLotteryConfigsUseCase } from "@/features/lotteries/server/application/usecases/listLotteryConfigsUseCase";
import { GetLotteryConfigUseCase } from "@/features/lotteries/server/application/usecases/getLotteryConfigUseCase";
import { ListLotteryConfigsLiteUseCase } from "@/features/lotteries/server/application/usecases/listLotteryConfigsLiteUseCase";

const repository = new PrismaLotteryConfigQueryRepository();
const listUseCase = new ListLotteryConfigsUseCase(repository);
const getUseCase = new GetLotteryConfigUseCase(repository);
const listLiteUseCase = new ListLotteryConfigsLiteUseCase(repository);

type MaybeTenant = string | undefined;
type Options = LotteryQueryOptions | undefined;
type FiltersInput = LotteryFilters | unknown;

export async function listLotteryConfigsServer(
  tenantIdOrFilters: string | FiltersInput,
  maybeFilters?: FiltersInput,
  options?: Options
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new ActionError(401, "UNAUTHORIZED");
  }

  const { tenantId: override, filters } = normalizeFiltersInput(tenantIdOrFilters, maybeFilters);
  const filtersRecord = normalizeFilters(filters);
  const { tenantId } = resolveTenantScope(
    createUserContext(session),
    filtersRecord,
    { tenantIdOverride: override }
  );

  return listUseCase.execute({
    filters,
    tenantId,
    options,
  });
}

export async function getLotteryConfigServer(
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

export async function listLotteryConfigsLiteServer(
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

function normalizeFilters(filters: FiltersInput) {
  if (typeof filters === "object" && filters !== null) {
    return filters as Record<string, unknown>;
  }
  return {};
}

export type { LotteryConfigListDTO as LotteryConfigListItem, LotteryConfigDetailDTO };
