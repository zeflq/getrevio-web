// features/campaigns/server/actions.ts
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  campaignCreateSchema,
  campaignUpdateSchema,
} from "@/features/campaigns/model/campaignSchema";
import { createServerActions } from "@/lib/helpers/createServerActions";
import { actionUser } from "@/lib/actionUser";

const deleteSchema = z.object({ id: z.string() });

const whereByIdTenant = (id: string, tenantId?: string) => ({
  id,
  ...(tenantId ? { tenantId } : {}),
});

const action = await createServerActions({
  actionClient: actionUser,
  delegate: prisma.campaign,
  whereByIdTenant,
  createSchema: campaignCreateSchema,
  updateSchema: campaignUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  revalidateTag: "campaigns",
  selectAfterCreate: {
    id: true,
    name: true,
    merchantId: true,
    placeId: true,
  },
});

export const createCampaignAction = action.createAction;
export const updateCampaignAction = action.updateAction;
export const deleteCampaignAction = action.deleteAction;
