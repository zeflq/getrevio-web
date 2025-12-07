"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withAuth, withTenantGuard } from "@/lib/actionUser";
import { lotteryConfigUpdateSchema } from "@/features/lotteries/model/lotterySchema";
import { SUPER_ADMIN } from "@/lib/utils";
import { PrismaLotteryConfigRepository } from "@/features/lotteries/server/infrastructure/prisma/prismaLotteryConfigRepository";
import { UpdateLotteryConfigUseCase } from "@/features/lotteries/server/application/usecases/updateLotteryConfigUseCase";
import { DeleteLotteryConfigUseCase } from "@/features/lotteries/server/application/usecases/deleteLotteryConfigUseCase";

const repository = new PrismaLotteryConfigRepository();
const updateUseCase = new UpdateLotteryConfigUseCase(repository);
const deleteUseCase = new DeleteLotteryConfigUseCase(repository);

export const updateLotteryConfigAction = withTenantGuard("merchantId")
  .inputSchema(lotteryConfigUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await updateUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("lotteries");

    return { ok: true } as const;
  });

const deleteSchema = z.object({ id: z.string() });

export const deleteLotteryConfigAction = withAuth
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("lotteries");

    return { ok: true } as const;
  });
