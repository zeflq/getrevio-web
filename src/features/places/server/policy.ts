import type { Prisma } from "@/generated/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { PlaceFilters } from "../model/placeSchema";

export const placeQueryPolicy = createQueryPolicy<PlaceFilters, Prisma.PlaceWhereInput>();
