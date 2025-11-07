"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";

import { withAuth, withTenantGuard } from "@/lib/actionUser";
import { landingUpdateSchema } from "@/features/landings/model/landingSchema";
import { SUPER_ADMIN } from "@/lib/utils";

import { PrismaLandingRepository } from "../../infrastructure/prisma/prismaLandingRepository";
import { UpdateLandingUseCase } from "../../application/usecases/updateLandingUseCase";
import { DeleteLandingUseCase } from "../../application/usecases/deleteLandingUseCase";

const repository = new PrismaLandingRepository();
const updateUseCase = new UpdateLandingUseCase(repository);
const deleteUseCase = new DeleteLandingUseCase(repository);

const updateSchema = landingUpdateSchema.extend({ id: z.string() });
const deleteSchema = z.object({ id: z.string() });

export const updateLandingAction = withTenantGuard("merchantId")
  .inputSchema(updateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await updateUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId ?? parsedInput.merchantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });

export const deleteLandingAction = withAuth
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userRole = ctx.isSuperAdmin ? SUPER_ADMIN : ctx.user.roles?.[0] ?? null;

    await deleteUseCase.execute({
      id: parsedInput.id,
      tenantId: ctx.tenantId,
      userRole,
    });

    await revalidateTag("landings");

    return { ok: true } as const;
  });
