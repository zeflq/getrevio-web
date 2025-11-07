import type { Prisma } from "@prisma/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { LandingFilters } from "../model/landingSchema";

export const landingQueryPolicy = createQueryPolicy<LandingFilters, Prisma.LandingWhereInput>();
