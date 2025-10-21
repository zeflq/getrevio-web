import type { Prisma } from "@prisma/client";

import type { ShortlinkFilters } from "../model/shortlinkSchema";

export const buildShortlinkWhere = (
  filters: ShortlinkFilters,
  tenantId?: string
): Prisma.ShortlinkWhereInput => ({
  ...(filters.q
    ? {
        OR: [
          { code: { contains: filters.q, mode: "insensitive" } },
          { channel: { contains: filters.q, mode: "insensitive" } },
        ],
      }
    : {}),
  ...(filters.merchantId ? { merchantId: filters.merchantId } : {}),
  ...(filters.channel ? { channel: filters.channel } : {}),
  ...(filters.status ? { active: filters.status === "active" } : {}),
  ...(tenantId ? { merchantId: tenantId } : {}),
});
