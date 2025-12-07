import type { Prisma } from "@/generated/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { MerchantFilters } from "../model/merchantSchema";

export const merchantQueryPolicy = createQueryPolicy<MerchantFilters, Prisma.MerchantWhereInput>();
