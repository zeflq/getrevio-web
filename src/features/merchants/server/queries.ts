// features/merchants/server/queries.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { merchantFiltersSchema } from "../model/merchantSchema";
import { createServerQueries } from "@/lib/helpers/createServerQueries";

const orderByMain = (f: { sort: "name" | "createdAt" | "plan" | "status"; order: "asc" | "desc" }) => ({
  [f.sort]: f.order,
});

const orderByLite = () => ({ name: "asc" as const });

export const { list: listMerchantsServer, getById: getMerchantServer, listLite: listMerchantsLiteServer } =
  createServerQueries({
    delegate: prisma.merchant,
    filterSchema: merchantFiltersSchema,
    // WHERE builder (single-tenant for now)
    buildWhere: (filters) => ({
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: filters.q, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
      ...(filters.plan ? { plan: filters.plan } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    }),
    orderBy: orderByMain,
    select: {
      id: true,
      name: true,
      email: true,
      defaultThemeId: true,
      plan: true,
      status: true,
      createdAt: true,
    },
    lite: {
      select: { id: true, name: true },
      orderBy: orderByLite,
      defaultLimit: 20,
      maxLimit: 50,
      // mapLite optional: default is { value: id, label: name }
      // mapLite: (r) => ({ value: r.id, label: r.name }),
    },
  });
