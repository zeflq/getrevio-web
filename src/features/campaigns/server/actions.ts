// features/campaigns/server/actions.ts
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/actionUser";

import { createServerActions } from "@/server/core/actions/createServerActions";
import { PrismaDefaultRepo } from "@/server/core/repos/prismaDefaultRepo";

import {
  campaignCreateSchema,
  campaignUpdateSchema,
} from "@/features/campaigns/model/campaignSchema";

// Delete payload schema
const deleteSchema = z.object({ id: z.string() });

// Tenant-scoped where clause
const whereByIdTenant = (id: string, tenantId?: string) => ({
  id,
  ...(tenantId ? { tenantId } : {}),
});

// Default CRUD repo on the campaigns delegate
const repo = new PrismaDefaultRepo(prisma.campaign);

const actions = await createServerActions({
  actionClient: actionUser,
  repo,
  whereByIdTenant,
  createSchema: campaignCreateSchema,
  updateSchema: campaignUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  getTenantId: (ctx) => ctx.user?.tenantId,   // enable multitenancy enforcement
  tenantKey: "tenantId",                       // stamped on create if provided
  revalidateTag: "campaigns",
  selectAfterCreate: {
    id: true,
    name: true,
    merchantId: true,
    placeId: true,
  },
  selectAfterUpdate: {
    id: true,
    name: true,
    merchantId: true,
    placeId: true,
  },
  // Optional hooks if you need extra control:
  // beforeCreate: async (input, ctx) => input,
  // beforeUpdate: async (id, patch, ctx) => patch,
});

export const createCampaignAction = actions.createAction;
export const updateCampaignAction = actions.updateAction;
export const deleteCampaignAction = actions.deleteAction;
