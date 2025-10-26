import type { ShortlinkUpdateInput } from "@/features/shortlinks/model/shortlinkSchema";

export type UpdateShortlinkCommand = ShortlinkUpdateInput & {
  id: string;
  tenantId?: string | null;
  userRole?: string | null;
};
