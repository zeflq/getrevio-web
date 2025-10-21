import type { Prisma } from "@prisma/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { PlaceFilters } from "../model/placeSchema";

export const placeQueryPolicy = createQueryPolicy<PlaceFilters, Prisma.PlaceWhereInput>();
