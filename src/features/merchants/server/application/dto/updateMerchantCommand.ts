import type { MerchantUpdateInput } from "@/features/merchants/model/merchantSchema";

export type UpdateMerchantCommand = MerchantUpdateInput & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};
