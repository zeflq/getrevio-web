"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaLandingRepository } from "../../infrastructure/prisma/prismaLandingRepository";
import { PrismaLandingQueryRepository } from "../../infrastructure/prisma/prismaLandingQueryRepository";
import { PublishLandingUseCase } from "../../application/usecases/publishLandingUseCase";

const repository = new PrismaLandingRepository();
const queryRepository = new PrismaLandingQueryRepository();
const publishUseCase = new PublishLandingUseCase(repository, queryRepository);

const publishSchema = z.object({
  id: z.string(),
  merchantId: z.string().min(1),
});

export const publishLandingAction = withTenantGuard("merchantId")
  .inputSchema(publishSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await publishUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });
