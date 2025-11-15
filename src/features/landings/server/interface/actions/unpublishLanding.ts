"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaLandingRepository } from "../../infrastructure/prisma/prismaLandingRepository";
import { UnpublishLandingUseCase } from "../../application/usecases/unpublishLandingUseCase";

const repository = new PrismaLandingRepository();
const unpublishUseCase = new UnpublishLandingUseCase(repository);

const unpublishSchema = z.object({
  id: z.string(),
  merchantId: z.string().min(1),
});

export const unpublishLandingAction = withTenantGuard("merchantId")
  .inputSchema(unpublishSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await unpublishUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });
