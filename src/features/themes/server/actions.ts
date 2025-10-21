// features/themes/server/actions.ts
"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/actionUser";
import { createServerActions } from "@/server/core/actions/createServerActions";
import {
  themeCreateSchema,
  themeUpdateSchema,
} from "@/features/themes/model/themeSchema";

import { themeRepo, themeSelect } from "./repo";

const deleteSchema = z.object({ id: z.string() });

const whereByIdTenant = (id: string, tenantId?: string) => ({
  id,
  ...(tenantId ? { merchantId: tenantId } : {}),
});

const actions = await createServerActions({
  actionClient: actionUser,
  repo: themeRepo,
  whereByIdTenant,
  createSchema: themeCreateSchema,
  updateSchema: themeUpdateSchema.extend({ id: z.string() }),
  deleteSchema,
  getTenantId: (ctx) => ctx.user?.tenantId,
  tenantKey: "merchantId",
  revalidateTag: "themes",
  beforeCreate: async (input) => input,
  beforeUpdate: async (_id, patch) => patch,
  selectAfterCreate: themeSelect,
  selectAfterUpdate: themeSelect,
});

export const createThemeAction = actions.createAction;
export const updateThemeAction = actions.updateAction;
export const deleteThemeAction = actions.deleteAction;

export const setDefaultThemeAction = actionUser
  .schema(
    z.object({
      merchantId: z.string().min(1),
      themeId: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    const { merchantId, themeId } = parsedInput;

    await prisma.merchant.update({
      where: { id: merchantId },
      data: { defaultThemeId: themeId },
    });

    return { ok: true } as const;
  });
