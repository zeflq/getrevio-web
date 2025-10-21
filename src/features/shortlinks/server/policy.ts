import type { Prisma } from "@prisma/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { ShortlinkFilters } from "../model/shortlinkSchema";

export const shortlinkQueryPolicy = createQueryPolicy<ShortlinkFilters, Prisma.ShortlinkWhereInput>();
