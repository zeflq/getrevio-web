import { ShortlinkFilters } from "@/features/shortlinks/model/shortlinkSchema";
import type { Shortlink } from "@/types/domain";

export type ShortlinkQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface ShortlinkQueryRepository {
  list(args: {
    filters: ShortlinkFilters;
    tenantId?: string;
    options?: ShortlinkQueryOptions;
  }): Promise<{ data: Shortlink[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: ShortlinkQueryOptions;
  }): Promise<Shortlink | null>;
}
