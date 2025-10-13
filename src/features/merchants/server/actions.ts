// features/merchants/server/actions.ts
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  merchantCreateSchema,
  merchantUpdateSchema,
} from "@/features/merchants/model/merchantSchema";
import { createServerActions } from "@/lib/helpers/createServerActions";
import { actionUser } from "@/lib/actionUser";

const deleteSchema = z.object({ id: z.string() });

// If/when you have multi-tenancy, add tenantId into where
const whereByIdTenant = (id: string, tenantId?: string) => ({
  id,
  ...(tenantId ? { tenantId } : {}),
});

const action = await createServerActions({
  actionClient: actionUser,
  delegate: prisma.merchant,
  whereByIdTenant,
  createSchema: merchantCreateSchema,
  updateSchema: merchantUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  getTenantId: (ctx) => ctx.user?.tenantId,
  revalidateTag: "merchants",
  // Optional: add hooks to sanitize or derive fields
  beforeCreate: async (input, ctx) => {
    // e.g., enforce defaults, strip fields the client shouldn't control
    return input;
  },
  beforeUpdate: async (_id, patch, ctx) => {
    // e.g., forbid plan/status changes for non-admins
    return patch;
  },
  selectAfterCreate: { id: true, name: true, email: true, plan: true, status: true },
});

export const createMerchantAction = action.createAction;
export const updateMerchantAction = action.updateAction;
export const deleteMerchantAction = action.deleteAction;