import type { MerchantCreateInput } from "@/features/merchants/model/merchantSchema";

export type CreateMerchantCommand = MerchantCreateInput & {
  tenantId?: string | null;
  userRole?: string | null;
};
