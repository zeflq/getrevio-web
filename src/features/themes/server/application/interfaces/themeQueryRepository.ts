import type { ThemeFilters } from "../../model/themeSchema";
import type { ThemeListDTO } from "../../mappers";

export type ThemeQueryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export interface ThemeQueryRepository {
  list(args: {
    filters: ThemeFilters;
    tenantId?: string;
    options?: ThemeQueryOptions;
  }): Promise<{ data: ThemeListDTO[]; total: number; totalPages: number }>;

  getById(args: {
    id: string;
    tenantId?: string;
    options?: ThemeQueryOptions;
  }): Promise<ThemeListDTO | null>;

  listLite(args: {
    filters: ThemeFilters;
    tenantId?: string;
    options?: ThemeQueryOptions;
  }): Promise<{ value: string; label: string }[]>;
}
