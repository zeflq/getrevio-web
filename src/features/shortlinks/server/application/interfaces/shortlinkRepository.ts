import type { ShortlinkCreateInput, ShortlinkUpdateInput } from "@/features/shortlinks/model/shortlinkSchema";
import type { Shortlink } from "@/types/domain";

export type ShortlinkCreateRecord = ShortlinkCreateInput & {
  code: string;
};

export type ShortlinkUpdateRecord = ShortlinkUpdateInput & {
  id: string;
};

export interface ShortlinkMutationRepository {
  create(data: ShortlinkCreateRecord): Promise<Shortlink>;
  update(data: ShortlinkUpdateRecord, tenantId?: string | null): Promise<{ previous: Shortlink | null; current: Shortlink }>;
  delete(id: string, tenantId?: string | null): Promise<Shortlink | null>;
  isCodeAvailable(code: string): Promise<boolean>;
  findById(id: string, tenantId?: string | null): Promise<Shortlink | null>;
}
