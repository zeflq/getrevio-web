"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withSuperAdmin, withTenantGuard } from "@/lib/actionUser";
import { SUPER_ADMIN } from "@/lib/utils";
import {
  merchantCreateSchema,
  merchantUpdateSchema,
} from "@/features/merchants/model/merchantSchema";

import { PrismaMerchantRepository } from "./infrastructure/prisma/prismaMerchantRepository";
import { CreateMerchantUseCase } from "./application/usecases/createMerchantUseCase";
import { UpdateMerchantUseCase } from "./application/usecases/updateMerchantUseCase";
import { DeleteMerchantUseCase } from "./application/usecases/deleteMerchantUseCase";

const repository = new PrismaMerchantRepository();
const createUseCase = new CreateMerchantUseCase(repository);
const updateUseCase = new UpdateMerchantUseCase(repository);
const deleteUseCase = new DeleteMerchantUseCase(repository);

const updateSchema = merchantUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const createMerchantAction = withSuperAdmin
  .inputSchema(merchantCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await createUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId,
      userRole: SUPER_ADMIN,
    });

    await revalidateTag("merchants");

    return result;
  });

export const updateMerchantAction = withTenantGuard("id")
  .inputSchema(updateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;
    const result = await updateUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.id,
      userRole,
    });

    await revalidateTag("merchants");

    return result;
  });

export const deleteMerchantAction = withSuperAdmin
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx }) => {
    const deleted = await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId,
      userRole: SUPER_ADMIN,
    });

    if (!deleted) {
      throw new Error("NOT_FOUND");
    }

    await revalidateTag("merchants");

    return { ok: true } as const;
  });
