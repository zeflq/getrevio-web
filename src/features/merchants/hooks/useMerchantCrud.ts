import { createCrudHooks } from "@/hooks/createCrudHooks";
import { Merchant } from "@/types/domain";
import { listMerchants } from "../api/listMerchants";
import { getMerchantById } from "../api/getMerchantById";
import { createMerchant } from "../api/createMerchant";
import { updateMerchant } from "../api/updateMerchant";
import { deleteMerchant } from "../api/deleteMerchant";
import type { MerchantCreateInput, MerchantLite, MerchantQueryParams, MerchantUpdateInput } from "../model/merchantSchema";

// Define the lite type (only the minimal fields you need in dropdowns, etc.)

// Build CRUD hooks using the shared utility and merchants API
const crud = createCrudHooks<Merchant, string, MerchantLite>({
  keyBase: ["merchants"],
  list: (params) => listMerchants(params as MerchantQueryParams),
  get: (id) => getMerchantById(id),
  create: (input) => createMerchant(input as MerchantCreateInput),
  update: (id, input) => updateMerchant(id, input as MerchantUpdateInput),
  remove: (id) => deleteMerchant(id),
  staleTimeMs: 60_000,
  lite: {
    map: (m) => ({ id: m.id, name: m.name }), // mapping full Merchant -> MerchantLite
    paramKey: "_lite",
    defaultLimit: 20,
  },
});

// Export typed hook wrappers for convenient usage
export const useMerchantsList = (params: MerchantQueryParams = {}) => crud.useList!(params);
export const useMerchantsLite = (params: Omit<MerchantQueryParams, "_lite"> = {}) => crud.useLite!(params);
export const useMerchantItem = (id?: string) => crud.useItem!(id);
export const useCreateMerchant = () => crud.useCreate!();
export const useUpdateMerchant = () => crud.useUpdate!();
export const useDeleteMerchant = () => crud.useRemove!();
