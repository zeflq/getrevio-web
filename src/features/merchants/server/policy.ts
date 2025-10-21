import type { Prisma } from "@prisma/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { MerchantFilters } from "../model/merchantSchema";

export const merchantQueryPolicy = createQueryPolicy<MerchantFilters, Prisma.MerchantWhereInput>();
