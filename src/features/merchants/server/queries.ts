import { ListMerchantsUseCase } from "./application/usecases/listMerchantsUseCase";
import { GetMerchantUseCase } from "./application/usecases/getMerchantUseCase";
import { ListMerchantsLiteUseCase } from "./application/usecases/listMerchantsLiteUseCase";
import type { MerchantQueryOptions } from "./application/interfaces/merchantQueryRepository";
import { PrismaMerchantQueryRepository } from "./infrastructure/prisma/prismaMerchantQueryRepository";

const repository = new PrismaMerchantQueryRepository();
const listUseCase = new ListMerchantsUseCase(repository);
const getUseCase = new GetMerchantUseCase(repository);
const listLiteUseCase = new ListMerchantsLiteUseCase(repository);

type FiltersInput = unknown;

export function listMerchantsServer(args: {
  filters: FiltersInput;
  tenantId?: string | null;
  options?: MerchantQueryOptions;
}) {
  return listUseCase.execute({
    filters: args.filters,
    tenantId: args.tenantId,
    options: args.options,
  });
}

export function getMerchantServer(args: {
  id: string;
  tenantId?: string | null;
  options?: MerchantQueryOptions;
}) {
  return getUseCase.execute({
    id: args.id,
    tenantId: args.tenantId,
    options: args.options,
  });
}

export function listMerchantsLiteServer(args: {
  filters: FiltersInput;
  tenantId?: string | null;
  options?: MerchantQueryOptions;
}) {
  return listLiteUseCase.execute({
    filters: args.filters,
    tenantId: args.tenantId,
    options: args.options,
  });
}

export type { MerchantListDTO as MerchantListItem } from "./mappers";
