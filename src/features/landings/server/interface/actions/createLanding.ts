"use server";

import { revalidateTag } from "next/cache";

import { withTenantGuard } from "@/lib/actionUser";
import { landingCreateSchema } from "@/features/landings/model/landingSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaLandingRepository } from "../../infrastructure/prisma/prismaLandingRepository";
import { CreateLandingUseCase } from "../../application/usecases/createLandingUseCase";

const repository = new PrismaLandingRepository();
const useCase = new CreateLandingUseCase(repository);

export const createLandingAction = withTenantGuard("merchantId")
  .inputSchema(landingCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await useCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });
