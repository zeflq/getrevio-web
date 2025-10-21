// features/places/server/actions.ts
"use server";

import { z } from "zod";

import { actionUser } from "@/lib/actionUser";
import { createServerActions } from "@/server/core/actions/createServerActions";

import {
  placeCreateSchema,
  placeUpdateSchema,
} from "@/features/places/model/placeSchema";
import { placeRepo, placeSelect } from "./repo";

const deleteSchema = z.object({ id: z.string() });

const whereByIdTenant = (id: string, tenantId?: string) => ({
  id,
  ...(tenantId ? { merchantId: tenantId } : {}),
});

const actions = await createServerActions({
  actionClient: actionUser,
  repo: placeRepo,
  whereByIdTenant,
  createSchema: placeCreateSchema,
  updateSchema: placeUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  getTenantId: (ctx) => ctx.user?.tenantId,
  tenantKey: "merchantId",
  revalidateTag: "places",
  beforeCreate: async (input) => input,
  beforeUpdate: async (_id, patch) => patch,
  selectAfterCreate: placeSelect,
  selectAfterUpdate: placeSelect,
});

export const createPlaceAction = actions.createAction;
export const updatePlaceAction = actions.updateAction;
export const deletePlaceAction = actions.deleteAction;
