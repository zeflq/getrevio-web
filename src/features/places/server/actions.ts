// features/places/server/actions.ts
"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/actionUser";
import { createServerActions } from "@/lib/helpers/createServerActions";
import {
  placeCreateSchema,
  placeUpdateSchema,
} from "@/features/places/model/placeSchema";

const deleteSchema = z.object({ id: z.string() });

const whereById = (id: string, tenantId?: string) => ({
  id,
  ...(tenantId ? { tenantId } : {}),
});

const actions = await createServerActions({
  actionClient: actionUser,
  delegate: prisma.place,
  whereByIdTenant: whereById,
  createSchema: placeCreateSchema,
  updateSchema: placeUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  getTenantId: (ctx) => ctx.user?.tenantId,
  revalidateTag: "places",
  beforeCreate: async (input) => input,
  beforeUpdate: async (_id, patch) => patch,
  selectAfterCreate: {
    id: true,
    merchantId: true,
    localName: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  },
});

export const createPlaceAction = actions.createAction;
export const updatePlaceAction = actions.updateAction;
export const deletePlaceAction = actions.deleteAction;
