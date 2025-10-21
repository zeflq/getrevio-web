import type { Prisma } from "@prisma/client";

import { createQueryPolicy } from "@/server/core/policies/queryPolicy";

import type { ThemeFilters } from "../model/themeSchema";

export const themeQueryPolicy = createQueryPolicy<ThemeFilters, Prisma.ThemeWhereInput>();
