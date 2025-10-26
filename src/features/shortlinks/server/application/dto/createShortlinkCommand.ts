import type { ShortlinkCreateInput } from "@/features/shortlinks/model/shortlinkSchema";

export type CreateShortlinkCommand = ShortlinkCreateInput & {
  tenantId?: string | null;
  userRole?: string | null;
};
