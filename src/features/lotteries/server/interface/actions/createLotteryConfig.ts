"use server";

import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { lotteryConfigCreateSchema } from "@/features/lotteries/model/lotterySchema";
import { SUPER_ADMIN } from "@/lib/utils";
import { PrismaLotteryConfigRepository } from "@/features/lotteries/server/infrastructure/prisma/prismaLotteryConfigRepository";
import { CreateLotteryConfigUseCase } from "@/features/lotteries/server/application/usecases/createLotteryConfigUseCase";

const repository = new PrismaLotteryConfigRepository();
const useCase = new CreateLotteryConfigUseCase(repository);

export const createLotteryConfigAction = withTenantGuard("merchantId")
  .inputSchema(lotteryConfigCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await useCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("lotteries");

    return { ok: true } as const;
  });
