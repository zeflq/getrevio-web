// features/merchants/server/actions.ts
"use server";

import { z } from "zod";

import { actionUser } from "@/lib/actionUser";
import { createServerActions } from "@/server/core/actions/createServerActions";

import {
  merchantCreateSchema,
  merchantUpdateSchema,
} from "@/features/merchants/model/merchantSchema";
import { merchantRepo, merchantSelect } from "./repo";

const deleteSchema = z.object({ id: z.string() });

const whereByIdTenant = (id: string) => ({
  id,
});

const actions = await createServerActions({
  actionClient: actionUser,
  repo: merchantRepo,
  whereByIdTenant,
  createSchema: merchantCreateSchema,
  updateSchema: merchantUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  getTenantId: () => undefined,
  tenantKey: undefined,
  revalidateTag: "merchants",
  selectAfterCreate: merchantSelect,
  selectAfterUpdate: merchantSelect,
});

export const createMerchantAction = actions.createAction;
export const updateMerchantAction = actions.updateAction;
export const deleteMerchantAction = actions.deleteAction;
