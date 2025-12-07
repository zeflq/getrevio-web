import type { Prisma } from "@/generated/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { LandingFilters } from "../model/landingSchema";

export const landingQueryPolicy = createQueryPolicy<LandingFilters, Prisma.LandingWhereInput>();
